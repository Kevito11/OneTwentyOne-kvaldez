/**
 * 1. RECIBIR DATOS POST (Registra al usuario respetando tu orden de columnas)
 */
function doPost(e) {
  try {
    var jsonString = e.postData.contents;
    var data = JSON.parse(jsonString);

    var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    // Si la acción es actualizar mercancía para un boleto existente
    if (data.action === 'updateMerch') {
      var codeToFind = data.ticketCode;
      if (!codeToFind) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Falta el código de boleto.' }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      var sheet = activeSpreadsheet.getSheetByName("Conferencia") || activeSpreadsheet.getActiveSheet();
      var values = sheet.getDataRange().getValues();
      var foundRowIndex = -1;

      for (var i = 1; i < values.length; i++) {
        if (String(values[i][2]).trim() === String(codeToFind).trim()) {
          foundRowIndex = i + 1; // 1-indexed row en Google Sheets
          break;
        }
      }

      if (foundRowIndex === -1) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'not_found', message: 'Código de boleto no encontrado en los registros.' }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      // Actualizar columnas J (10: Interés), K (11: Items), L (12: Total)
      sheet.getRange(foundRowIndex, 10).setValue('Sí');
      sheet.getRange(foundRowIndex, 11).setValue(data.merchItems || 'Ninguno');
      sheet.getRange(foundRowIndex, 12).setValue(data.merchTotal || 0);

      // Construir objeto con datos de la fila + nueva mercancía
      var rowData = values[foundRowIndex - 1];
      var updatedData = {
        firstName: rowData[3],
        lastName: rowData[4],
        email: rowData[5],
        phone: rowData[6],
        church: rowData[7],
        ageGroup: rowData[8],
        ticketCode: codeToFind,
        interestedInMerch: 'Sí',
        merchItems: data.merchItems || 'Ninguno',
        merchTotal: data.merchTotal || 0,
        merchImageUrls: data.merchImageUrls || '',
        event: rowData[12] || 'Conferencia Sin Filtros',
        eventType: (rowData[12] && rowData[12].indexOf('RESET') !== -1) ? 'vigilia' : 'conferencia',
        ticketUrl: data.ticketUrl || ("https://ministeriodejovenesicc.netlify.app/ticket/" + codeToFind),
        activeTheme: data.activeTheme // Sincronizado
      };

      try {
        enviarCorreoConfirmacion(updatedData);
      } catch (emailError) {
        console.error("Error al enviar correo de actualización: " + emailError.toString());
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Mercancía actualizada correctamente.',
        updatedData: updatedData
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Nueva Inscripción
    var isVigilia = data.eventType === "vigilia" || (data.ticketCode && data.ticketCode.indexOf("RESET") !== -1);
    var isCena = data.eventType === "cena";
    var isCampamento = data.eventType === "campamento";

    var targetSheetName = "Conferencia";
    if (isVigilia) {
      targetSheetName = "Media Vigilia";
    } else if (isCena) {
      targetSheetName = "Cena de Jóvenes";
    } else if (isCampamento) {
      targetSheetName = "Campamento";
    }

    var sheet = activeSpreadsheet.getSheetByName(targetSheetName);

    if (!sheet) {
      sheet = activeSpreadsheet.insertSheet(targetSheetName);
      var headers = (isVigilia || isCena || isCampamento)
        ? ["Fecha", "Hora", "Código de Boleto", "Nombre", "Apellido", "Correo", "Teléfono", "Iglesia", "Rango de Edad", "Nombre del Evento"]
        : ["Fecha", "Hora", "Código de Boleto", "Nombre", "Apellido", "Correo", "Teléfono", "Iglesia", "Rango de Edad", "Interés en Mercancía", "Artículos de Mercancía", "Total de Venta", "Nombre del Evento"];
      sheet.appendRow(headers);
    }

    var now = new Date();
    var timezone = Session.getScriptTimeZone();
    var dateFormatted = Utilities.formatDate(now, timezone, "dd/MM/yyyy");
    var timeFormatted = Utilities.formatDate(now, timezone, "hh:mm:ss a");

    var rowData;
    if (isVigilia || isCena || isCampamento) {
      // Omit J, K, L columns (no merch)
      rowData = [
        dateFormatted,                // Fecha (Columna A)
        timeFormatted,                // Hora (Columna B)
        data.ticketCode,              // Código de Boleto (Columna C)
        data.firstName,               // Nombre (Columna D)
        data.lastName,                // Apellido (Columna E)
        data.email,                   // Correo (Columna F)
        data.phone,                   // Teléfono (Columna G)
        data.church,                  // Iglesia (Columna H)
        data.ageGroup,                // Rango de Edad (Columna I)
        data.event || (isCena ? 'Cena de Jóvenes ICC 2026' : (isCampamento ? 'Campamento de Jóvenes ICC 2027' : 'Media Vigilia RESET')) // Nombre del Evento (Columna J)
      ];
    } else {
      // Standard Conferencia columns
      rowData = [
        dateFormatted,                // Fecha (Columna A)
        timeFormatted,                // Hora (Columna B)
        data.ticketCode,              // Código de Boleto (Columna C)
        data.firstName,               // Nombre (Columna D)
        data.lastName,                // Apellido (Columna E)
        data.email,                   // Correo (Columna F)
        data.phone,                   // Teléfono (Columna G)
        data.church,                  // Iglesia (Columna H)
        data.ageGroup,                // Rango de Edad (Columna I)
        data.interestedInMerch,       // Interés en Mercancía (Columna J)
        data.merchItems || 'Ninguno', // Artículos de Mercancía (Columna K)
        data.merchTotal || 0,         // Total de Venta (Columna L)
        data.event || 'Conferencia Sin Filtros' // Nombre del Evento (Columna M)
      ];
    }

    sheet.appendRow(rowData);

    try {
      enviarCorreoConfirmacion(data);
    } catch (emailError) {
      console.error("Error al enviar el correo: " + emailError.toString());
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 2. RECIBIR CONSULTA GET (Busca un boleto por código en la columna C)
 */
function doGet(e) {
  try {
    var codeToFind = e.parameter.code;
    if (!codeToFind) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Falta el código de boleto' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();

    for (var s = 0; s < sheets.length; s++) {
      var sheet = sheets[s];
      var data = sheet.getDataRange().getValues();

      for (var i = 1; i < data.length; i++) {
        if (String(data[i][2]).trim() === String(codeToFind).trim()) {
          var sheetName = sheet.getName();
          var isNoMerchSheet = sheetName === "Media Vigilia" || sheetName === "Cena de Jóvenes" || sheetName === "Campamento";

          var result = {
            status: 'success',
            date: data[i][0],
            time: data[i][1],
            ticketCode: data[i][2],
            firstName: data[i][3],
            lastName: data[i][4],
            email: data[i][5],
            phone: data[i][6],
            church: data[i][7],
            ageGroup: data[i][8]
          };

          if (isNoMerchSheet) {
            // Media Vigilia, Cena, Campamento columns (no merch)
            result.interestedInMerch = 'No';
            result.merchItems = 'Ninguno';
            result.merchTotal = 0;
            result.event = data[i][9] || (sheetName === 'Cena de Jóvenes' ? 'Cena de Jóvenes 2026' : (sheetName === 'Campamento' ? 'Campamento de Jóvenes 2027' : 'Media Vigilia RESET'));
          } else {
            // Conferencia columns (with merch)
            result.interestedInMerch = data[i][9];
            result.merchItems = data[i][10];
            result.merchTotal = data[i][11];
            result.event = data[i][12] || 'Conferencia Sin Filtros';
          }

          return ContentService.createTextOutput(JSON.stringify(result))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'not_found', message: 'Boleto no encontrado' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 3. GENERACIÓN Y ENVÍO DE CORREO POR MAILAPP
 */
function enviarCorreoConfirmacion(data) {
  var email = data.email;
  console.log("Intentando enviar correo a: " + email);

  // Detectar si el registro es para la Media Vigilia
  var isVigilia = data.eventType === "vigilia" || (data.ticketCode && data.ticketCode.indexOf("RESET") !== -1);
  var isCena = data.eventType === "cena";
  var isCampamento = data.eventType === "campamento";

  var subject = "";
  if (isVigilia) {
    subject = "🔥 ¡Registro Confirmado! Prepárate para la Media Vigilia RESET 2026";
  } else if (isCena) {
    subject = "🍽️ ¡Pre-Registro Recibido! - Cena de Jóvenes ICC 2026";
  } else if (isCampamento) {
    subject = "🏕️ ¡Pre-Registro Recibido! - Campamento de Jóvenes ICC 2027";
  } else {
    subject = "🎫 Tu Boleto de Entrada - Sin Filtros 2026";
  }

  var ticketUrl = data.ticketUrl;
  if (!ticketUrl) {
    ticketUrl = "https://ministeriodejovenesicc.netlify.app/ticket/" + data.ticketCode;
  }

  var qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + encodeURIComponent(ticketUrl);

  var eventSubtitle = "Conferencia de Jóvenes ICC";
  var eventNameText = "SIN FILTROS 2026";
  var welcomeText = "";
  var dateTimeText = "";
  var ticketLabelText = "Código de Entrada";
  var buttonText = "Ver mi Boleto en Línea";
  var qrNoteText = "Presenta este código QR en la entrada";

  if (isVigilia) {
    eventSubtitle = "Pre-Conferencia: Media Vigilia";
    eventNameText = "RESET";
    welcomeText = "¡Hola <strong>" + data.firstName + "</strong>! 👋 ¡Que Dios te bendiga mucho!<br><br>¡Tu registro para la Media Vigilia <strong>RESET</strong> ha sido completado con éxito! 🎉<br><br>Estamos muy emocionados de que nos acompañes en este tiempo tan especial. Creemos firmemente que antes de la gran conferencia <em>Sin Filtros 2026</em>, necesitamos buscar al Señor en oración unida, interceder por la juventud y pedirle que 'reinicie' (RESET) nuestros corazones en Su presencia. ¡Ven con el corazón expectante! 🙌✨";
    dateTimeText = "Sábado 22 Agosto, 2026 - 06:00 PM";
  } else if (isCena) {
    eventSubtitle = "Pre-Registro: Cena de Jóvenes ICC";
    eventNameText = "CENA DE JÓVENES ICC 2026";
    welcomeText = "¡Hola <strong>" + data.firstName + "</strong>! 👋 ¡Que Dios te bendiga mucho!<br><br>Hemos recibido con éxito tu solicitud de pre-registro para la <strong>Cena de Jóvenes ICC 2026</strong>. 🎉<br><br>Te recordamos que esta actividad tendrá un costo. Una vez se abran las inscripciones formales, te notificaremos por correo electrónico y a través de nuestras redes sociales con los montos del evento y las instrucciones de pago para completar tu inscripción formal. ¡Asegura tu cupo temprano y acompáñanos a celebrar juntos este año de fe! 🍽️✨";
    dateTimeText = "Sábado 5 Diciembre, 2026 - 07:00 PM";
    ticketLabelText = "Código de Pre-Reserva";
    buttonText = "Ver mi Pre-Registro en Línea";
    qrNoteText = "Código QR de referencia para tu pre-registro";
  } else if (isCampamento) {
    eventSubtitle = "Pre-Registro: Campamento ICC 2027";
    eventNameText = "CAMPAMENTO JÓVENES ICC 2027";
    welcomeText = "¡Hola <strong>" + data.firstName + "</strong>! 👋 ¡Que Dios te bendiga mucho!<br><br>Hemos recibido con éxito tu solicitud de pre-registro para el <strong>Campamento de Jóvenes ICC 2027</strong>. 🏕️<br><br>Te recordamos que esta actividad tendrá un costo. Una vez se abran las inscripciones formales, te notificaremos por correo electrónico y a través de nuestras redes sociales con los montos del evento y las instrucciones de pago para completar tu inscripción formal. ¡Asegura tu cupo temprano para que vivamos juntos este hermoso tiempo de búsqueda del Señor! 🙌🔥";
    dateTimeText = "16 al 18 de Abril, 2027 - Salida 02:00 PM";
    ticketLabelText = "Código de Pre-Reserva";
    buttonText = "Ver mi Pre-Registro en Línea";
    qrNoteText = "Código QR de referencia para tu pre-registro";
  } else {
    welcomeText = "¡Tu registro para la conferencia de jóvenes <strong>Sin Filtros 2026</strong> ha sido completado con éxito!";
    dateTimeText = "Sábado 29 Agosto, 2026 - 03:00 PM";
  }

  var merchHtml = "";
  if (!isVigilia && !isCena && !isCampamento && data.interestedInMerch === "Sí" && data.merchTotal > 0) {
    var totalVal = "RD$ " + Number(data.merchTotal).toLocaleString();

    // Generar bloque HTML de imágenes si vienen en data
    var imagesHtml = "";
    if (data.merchImageUrls) {
      var urls = data.merchImageUrls.split(",");
      imagesHtml = '<div style="margin-top: 12px; font-size: 0;">';
      for (var u = 0; u < urls.length; u++) {
        var url = urls[u].trim();
        if (url) {
          var safeUrl = encodeURI(decodeURI(url));
          imagesHtml += '<img src="' + safeUrl + '" alt="Producto reservado" width="80" height="80" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #333333; margin-right: 8px; margin-bottom: 8px; display: inline-block;" />';
        }
      }
      imagesHtml += '</div>';
    }

    merchHtml = `
      <tr>
        <td style="padding-top: 16px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #141414; border: 1px dashed #333333; border-radius: 12px; padding: 20px;">
            <tr>
              <td style="font-size: 14px; font-weight: bold; color: #ffffff; padding-bottom: 8px;">
                🛍️ Mercancía Oficial Reservada
              </td>
            </tr>
            <tr>
              <td style="font-size: 13px; color: #aaaaaa; padding-bottom: 12px; line-height: 1.4;">
                ${data.merchItems}
                ${imagesHtml}
              </td>
            </tr>
            <tr>
              <td style="border-top: 1px solid #222222; padding-top: 10px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #cccccc;">
                  <tr>
                    <td>Pago Requerido (100%):</td>
                    <td align="right" style="color: #ffffff; font-weight: bold;">${totalVal}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="font-size: 11px; color: #888888; padding-top: 12px; line-height: 1.4;">
                <strong>Instrucciones de Pago:</strong><br>
                Deposita o transfiere el monto total e indica como concepto: <strong>${data.ticketCode} - ${data.firstName} ${data.lastName}</strong>.<br><br>
                • <strong>Banreservas (Ahorro):</strong> <code>9607274318</code> &mdash; Joelmary Hernandez &mdash; Cédula: 402-3603056-1<br>
                • <strong>Banco Popular (Corriente):</strong> <code>836288449</code> &mdash; David J. Chez &mdash; Cédula: 402-0037969-7<br><br>
                Una vez recibido el pago, estaremos contactando cuando esté listo y disponible para retirar en la iglesia.<br><br>
                <strong style="color: #f87171;">⚠️ Fecha límite de pago: 09 de agosto de 2026.</strong><br>
                Por favor, completa tu pago a tiempo. Pasada esta fecha, las reservas no pagadas se cancelarán automáticamente y no podremos garantizar la disponibilidad de tus artículos.<br><br>
                <a href="https://wa.me/18096299236?text=COMPROBANTE%20DE%20PAGO%20-%20REGISTRO%20CONFERENCIA%0A%0AAsistente%3A%20${encodeURIComponent(data.firstName + ' ' + data.lastName)}%0ACódigo%20de%20Boleto%3A%20${encodeURIComponent(data.ticketCode)}" target="_blank" style="color: #ffffff; font-weight: bold; text-decoration: underline;">Enviar comprobante por WhatsApp al (809) 629-9236</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }

  // Design variables matching the specific event (Vigilia vs Conferencia stages)
  var theme = getEmailTheme(isVigilia, data.activeTheme);
  
  if (isCena) {
    theme = {
      outerBg: "#030202",
      cardBg: "#0b0a0a",
      cardBorderColor: "#3c102a",
      detailsBg: "#141012",
      detailsBorderColor: "#54133b",
      accentColorText: "#db2777",
      textColorMuted: "#a68597",
      textCodeColor: "#fdd6eb",
      headerColor: "#db2777"
    };
  } else if (isCampamento) {
    theme = {
      outerBg: "#020302",
      cardBg: "#0a0b0a",
      cardBorderColor: "#103c20",
      detailsBg: "#101411",
      detailsBorderColor: "#13542b",
      accentColorText: "#059669",
      textColorMuted: "#85a68e",
      textCodeColor: "#d6fde3",
      headerColor: "#059669"
    };
  }

  var outerBg = theme.outerBg;
  var cardBg = theme.cardBg;
  var cardBorderColor = theme.cardBorderColor;
  var detailsBg = theme.detailsBg;
  var detailsBorderColor = theme.detailsBorderColor;
  var accentColorText = theme.accentColorText;
  var textColorMuted = theme.textColorMuted;
  var textCodeColor = theme.textCodeColor;
  var headerColor = theme.headerColor;

  var htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="background-color: ${outerBg}; color: #ffffff; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${outerBg}; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="500" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: ${cardBg}; border: 1px solid ${cardBorderColor}; border-radius: 16px; padding: 32px; text-align: left;">
              <tr>
                <td align="center" style="padding-bottom: 24px; border-bottom: 1px solid ${cardBorderColor};">
                  <div style="color: ${textColorMuted}; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">${eventSubtitle}</div>
                  <div style="font-size: 24px; font-weight: 800; color: ${headerColor}; letter-spacing: -0.5px;">${eventNameText}</div>
                  <div style="color: #666666; font-size: 13px; margin-top: 4px;">OneTwentyOne</div>
                </td>
              </tr>
              <tr>
                <td style="font-size: 15px; color: #dddddd; line-height: 1.6; padding: 24px 0 16px 0;">
                  Hola <strong>${data.firstName}</strong>,<br><br>
                  ${welcomeText}
                </td>
              </tr>
              <tr>
                <td>
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${detailsBg}; border: 1px solid ${detailsBorderColor}; border-radius: 12px; padding: 20px;">
                    <tr>
                      <td style="font-size: 11px; color: ${textColorMuted}; padding-bottom: 2px;">Asistente</td>
                    </tr>
                    <tr>
                      <td style="font-size: 15px; font-weight: bold; color: #ffffff; padding-bottom: 12px;">${data.firstName} ${data.lastName}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 11px; color: ${textColorMuted}; padding-bottom: 2px;">${ticketLabelText}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 16px; font-weight: bold; font-family: monospace; color: ${textCodeColor}; padding-bottom: 12px; letter-spacing: 0.5px;">${data.ticketCode}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 11px; color: ${textColorMuted}; padding-bottom: 2px;">Fecha y Hora</td>
                    </tr>
                    <tr>
                      <td style="font-size: 14px; color: #ffffff; padding-bottom: 12px;">${dateTimeText}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 11px; color: ${textColorMuted}; padding-bottom: 2px;">Lugar</td>
                    </tr>
                    <tr>
                      <td style="font-size: 13px; color: #ffffff; padding-bottom: 12px; line-height: 1.4;">
                        Iglesia de Convertidos a Cristo (ICC)<br>
                        C/ Dr. Núñez Domínguez #30, La Julia, Santo Domingo
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-top: 16px; border-top: 1px solid ${cardBorderColor};">
                        <img src="${qrCodeUrl}" alt="QR Entrada" width="150" height="150" style="border: 4px solid #ffffff; border-radius: 6px; display: block; margin: 0 auto;" />
                        <span style="font-size: 11px; color: ${textColorMuted}; display: block; margin-top: 8px; margin-bottom: 8px;">${qrNoteText}</span>
                        <a href="${ticketUrl}" target="_blank" style="font-size: 13px; color: ${accentColorText}; font-weight: bold; text-decoration: underline; display: block;">${buttonText}</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              ${merchHtml}
              <tr>
                <td style="padding-top: 24px; font-size: 12px; color: ${textColorMuted}; line-height: 1.5; border-top: 1px solid ${cardBorderColor}; margin-top: 24px;">
                  Si tienes alguna duda o necesitas modificar tus datos de registro, escríbenos a nuestra cuenta de Instagram <a href="https://www.instagram.com/onetwentyoneicc" target="_blank" style="color: #ffffff; text-decoration: underline;">@onetwentyoneicc</a>.
                </td>
              </tr>
            </table>
            <table width="100%" max-width="500" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; text-align: center; margin-top: 20px;">
              <tr>
                <td style="font-size: 10px; color: #555555; line-height: 1.4;">
                  Este correo fue enviado automáticamente por tu registro en la plataforma de OneTwentyOne.<br>
                  © 2026 Iglesia de Convertidos a Cristo. Todos los derechos reservados.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  var senderName = "Sin Filtros 2026";
  if (isVigilia) senderName = "Media Vigilia RESET";
  else if (isCena) senderName = "Cena de Jóvenes";
  else if (isCampamento) senderName = "Campamento de Jóvenes";

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: htmlBody,
    name: senderName
  });

  console.log("Correo enviado con éxito.");
}

/**
 * 4. FUNCIÓN AUXILIAR PARA FORZAR PERMISOS
 */
function probarPermisos() {
  MailApp.sendEmail(Session.getActiveUser().getEmail(), "Prueba de Permisos", "Si lees esto, los permisos están activos.");
}

/**
 * 5. MENÚ DE ADMINISTRACIÓN EN GOOGLE SHEETS
 * Aparece en la barra superior al abrir o recargar la hoja de cálculo.
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();

  // Submenú para pruebas de Media Vigilia
  var pruebasVigiliaMenu = ui.createMenu('Pruebas')
    .addItem('1. Enviar Prueba: Mañana nos encontramos', 'enviarPruebaVigiliaManana')
    .addItem('2. Enviar Prueba: Hoy es el día', 'enviarPruebaVigiliaHoy');

  // Menú principal de Media Vigilia
  var vigiliaMenu = ui.createMenu('Media Vigilia')
    .addItem('1. Enviar Masivo: Mañana nos encontramos', 'enviarMasivoVigiliaManana')
    .addItem('2. Enviar Masivo: Hoy es el día', 'enviarMasivoVigiliaHoy')
    .addSeparator()
    .addSubMenu(pruebasVigiliaMenu);

  // Submenú para pruebas de Conferencia
  var pruebasConferenciaMenu = ui.createMenu('Pruebas')
    .addItem('1. Enviar Prueba: Extensión de Pago', 'enviarCorreoPruebaAdmin')
    .addItem('2. Enviar Prueba: Invitación de Mercancía', 'enviarCorreoPruebaInvitacionAdmin')
    .addItem('3. Enviar Prueba: Confirmación de Pago', 'enviarCorreoPruebaPagoConfirmadoAdmin');

  // Menú principal de Conferencia
  var conferenciaMenu = ui.createMenu('Conferencia Sin Filtros')
    .addItem('1. Enviar Masivo: Extensión de Pago (A NO PAGADOS)', 'enviarNotificacionExtensionPago')
    .addItem('2. Enviar Masivo: Invitación de Mercancía (A NO INTERESADOS)', 'enviarNotificacionInvitacionMercancia')
    .addItem('3. Enviar Masivo: Confirmación de Pago (A PAGADOS)', 'enviarNotificacionConfirmacionPago')
    .addSeparator()
    .addSubMenu(pruebasConferenciaMenu);

  // Registrar el menú principal en la interfaz
  ui.createMenu('OneTwentyOne - Admin')
    .addSubMenu(vigiliaMenu)
    .addSubMenu(conferenciaMenu)
    .addToUi();
}

/**
 * Envía una prueba del correo de "Mañana nos encontramos" al administrador.
 */
function enviarPruebaVigiliaManana() {
  var adminEmail = "kevito.valdez@gmail.com";
  try {
    enviarCorreoRecordatorioVigilia(adminEmail, "Kevin (Prueba)", "Valdez", false);
    SpreadsheetApp.getUi().alert("Correo de prueba (Mañana nos encontramos) enviado a " + adminEmail);
  } catch (e) {
    SpreadsheetApp.getUi().alert("Error al enviar prueba: " + e.toString());
  }
}

/**
 * Envía una prueba del correo de "Hoy es el día" al administrador.
 */
function enviarPruebaVigiliaHoy() {
  var adminEmail = "kevito.valdez@gmail.com";
  try {
    enviarCorreoRecordatorioVigilia(adminEmail, "Kevin (Prueba)", "Valdez", true);
    SpreadsheetApp.getUi().alert("Correo de prueba (Hoy es el día) enviado a " + adminEmail);
  } catch (e) {
    SpreadsheetApp.getUi().alert("Error al enviar prueba: " + e.toString());
  }
}

/**
 * Envía el correo de "Mañana nos encontramos" de forma masiva a todos los inscritos en la Media Vigilia.
 */
function enviarMasivoVigiliaManana() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    'Confirmación de envío masivo (Mañana nos encontramos)',
    '¿Estás seguro de que deseas enviar el mensaje "Mañana nos encontramos" a todos los inscritos en la hoja "Media Vigilia"?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Media Vigilia");
  if (!sheet) {
    ui.alert("Error", "No se encontró la hoja con el nombre 'Media Vigilia'. Asegúrate de que existe.", ui.ButtonSet.OK);
    return;
  }

  var data = sheet.getDataRange().getValues();
  var count = 0;

  for (var i = 1; i < data.length; i++) {
    var firstName = data[i][3]; // Columna D
    var lastName = data[i][4]; // Columna E
    var email = data[i][5]; // Columna F

    if (email && email.trim() !== "") {
      try {
        enviarCorreoRecordatorioVigilia(email.trim(), firstName, lastName, false);
        count++;
        Utilities.sleep(150); // Pausa prudente para respetar límites de cuota de Apps Script
      } catch (e) {
        console.error("Error enviando correo a " + email + ": " + e.toString());
      }
    }
  }

  ui.alert("Proceso completado", "Se han enviado " + count + " correos de recordatorio (Mañana nos encontramos).", ui.ButtonSet.OK);
}

/**
 * Envía el correo de "Hoy es el día" de forma masiva a todos los inscritos en la Media Vigilia.
 */
function enviarMasivoVigiliaHoy() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    'Confirmación de envío masivo (Hoy es el día)',
    '¿Estás seguro de que deseas enviar el mensaje "Hoy es el día" a todos los inscritos en la hoja "Media Vigilia"?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Media Vigilia");
  if (!sheet) {
    ui.alert("Error", "No se encontró la hoja con el nombre 'Media Vigilia'. Asegúrate de que existe.", ui.ButtonSet.OK);
    return;
  }

  var data = sheet.getDataRange().getValues();
  var count = 0;

  for (var i = 1; i < data.length; i++) {
    var firstName = data[i][3]; // Columna D
    var lastName = data[i][4]; // Columna E
    var email = data[i][5]; // Columna F

    if (email && email.trim() !== "") {
      try {
        enviarCorreoRecordatorioVigilia(email.trim(), firstName, lastName, true);
        count++;
        Utilities.sleep(150); // Pausa prudente para respetar límites de cuota de Apps Script
      } catch (e) {
        console.error("Error enviando correo a " + email + ": " + e.toString());
      }
    }
  }

  ui.alert("Proceso completado", "Se han enviado " + count + " correos de recordatorio (Hoy es el día).", ui.ButtonSet.OK);
}

function enviarCorreoRecordatorioVigilia(email, firstName, lastName, isHoy) {
  var subject = isHoy
    ? "🔥 Hoy es el día 🤍 | Media Vigilia RESET"
    : "🔔 Mañana nos encontramos 🤍 | Media Vigilia RESET";

  var htmlMessage = isHoy
    ? `<strong>Hoy es el día. 🤍</strong><br><br>
       En pocas horas estaremos juntos en nuestra Media Vigilia: <span style="color: #FF3800; font-weight: bold;">+ Cristo − yo</span>.<br><br>
       A las 6:00 p. m. comenzamos, y queremos recordarte algo sencillo: ven con un corazón dispuesto.<br><br>
       Dispuesto a escuchar.<br>
       Dispuesto a ser confrontado por la Palabra.<br>
       Dispuesto a dejar a un lado el ruido, las cargas y el “yo”, para poner nuestra mirada en Cristo.<br><br>
       No vengas esperando simplemente una actividad más.<br>
       Ven esperando que Dios use Su Palabra para trabajar en tu corazón.<br><br>
       Si el “yo” mengua, Cristo crece.<br><br>
       🕕 <strong>Hoy | 6:00 p. m.</strong><br><br>
       Nos vemos en unas horas.<br><br>
       <span style="color: #FF3800; font-weight: bold; font-size: 18px;">+ Cristo</span><br>
       <span style="color: #a69385; font-weight: bold; font-size: 18px;">− yo</span>`
    : `<strong>Mañana nos encontramos. 🤍</strong><br><br>
       Estamos a solo un día de nuestra Media Vigilia: <span style="color: #FF3800; font-weight: bold;">+ Cristo − yo</span>.<br><br>
       Más que una actividad, queremos que sea un tiempo para detenernos, silenciar el ruido y volver nuestra atención a quien verdaderamente importa: Cristo.<br><br>
       No tienes que llevar nada especial.<br>
       Solo preséntate dispuesto a escuchar a Cristo, a ser confrontado por Su Palabra y a rendir aquello que todavía ocupa demasiado espacio en ti.<br><br>
       Porque mientras Cristo crece en nosotros, el “yo” debe menguar.<br><br>
       📅 <strong>Mañana, sábado 22 de agosto</strong><br>
       🕕 <strong>Iniciamos a las 6:00 p. m.</strong><br><br>
       Ven con un corazón dispuesto.<br><br>
       <span style="color: #FF3800; font-weight: bold; font-size: 18px;">+ Cristo</span><br>
       <span style="color: #a69385; font-weight: bold; font-size: 18px;">− yo</span>`;

  var htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="background-color: #030202; color: #ffffff; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #030202; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="500" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #0b0a0a; border: 1px solid #FF3800; border-radius: 16px; padding: 32px; text-align: left;">
              <tr>
                <td align="center" style="padding-bottom: 24px; border-bottom: 1px solid #FF3800;">
                  <div style="color: #a69385; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">Pre-Conferencia: Media Vigilia</div>
                  <div style="font-size: 24px; font-weight: 800; color: #FF3800; letter-spacing: -0.5px;">RESET</div>
                  <div style="color: #666666; font-size: 13px; margin-top: 4px;">OneTwentyOne</div>
                </td>
              </tr>
              <!-- Portada de la Media Vigilia -->
              <tr>
                <td align="center" style="padding-top: 24px;">
                  <img src="https://ministeriodejovenesicc.netlify.app/media-vigilia-reset.jpeg" alt="Media Vigilia RESET 2026" style="width: 100%; max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #FF3800; display: block;" />
                </td>
              </tr>
              <tr>
                <td style="font-size: 15px; color: #dddddd; line-height: 1.6; padding: 24px 0 16px 0;">
                  ¡Hola <strong>${firstName}</strong>! 👋<br><br>
                  ${htmlMessage}
                </td>
              </tr>
              <tr>
                <td style="padding-top: 24px; font-size: 12px; color: #a69385; line-height: 1.5; border-top: 1px solid #FF3800; margin-top: 24px;">
                  Si tienes alguna duda o necesitas asistencia, escríbenos a nuestra cuenta de Instagram <a href="https://www.instagram.com/onetwentyoneicc" target="_blank" style="color: #ffffff; text-decoration: underline;">@onetwentyoneicc</a>.
                </td>
              </tr>
            </table>
            <table width="100%" max-width="500" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; text-align: center; margin-top: 20px;">
              <tr>
                <td style="font-size: 10px; color: #555555; line-height: 1.4;">
                  Este correo fue enviado automáticamente por tu registro en la plataforma de OneTwentyOne.<br>
                  © 2026 Iglesia de Convertidos a Cristo. Todos los derechos reservados.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: htmlBody,
    name: "Media Vigilia RESET"
  });
}



/**
 * Envía una prueba del correo de extensión a kevito.valdezg@gmail.com usando datos de la hoja.
 */
function enviarCorreoPruebaAdmin() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Conferencia") || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();

  var sampleRecord = null;

  // Buscar el primer registro de la conferencia con mercancía y sin pagar
  for (var i = 1; i < data.length; i++) {
    var ticketCode = data[i][2];
    var interestedInMerch = data[i][9];
    var merchTotal = Number(data[i][11] || 0);
    var event = data[i][12] || '';
    var pago = String(data[i][13] || '').trim(); // Columna N

    var isVigilia = (ticketCode && ticketCode.indexOf("RESET") !== -1) || (event.indexOf("RESET") !== -1);

    if (!isVigilia && interestedInMerch === "Sí" && merchTotal > 0 && pago !== "Si") {
      sampleRecord = {
        firstName: data[i][3],
        lastName: data[i][4],
        ticketCode: ticketCode,
        merchItems: data[i][10],
        merchTotal: merchTotal
      };
      break;
    }
  }

  // Si no hay registros que coincidan, usamos datos ficticios de prueba
  if (!sampleRecord) {
    sampleRecord = {
      firstName: "Kevin (Prueba)",
      lastName: "Valdez",
      ticketCode: "121-ICC-5727",
      merchItems: "1x Gorra \"Sin Filtros\" - Negro",
      merchTotal: 750
    };
  }

  // Sobrescribimos el correo para que sea el de Kevin para la prueba
  sampleRecord.email = "kevito.valdez@gmail.com";

  enviarCorreoNotificacionExtension(sampleRecord);
  SpreadsheetApp.getUi().alert("Correo de prueba enviado a kevito.valdez@gmail.com con el código de boleto: " + sampleRecord.ticketCode);
}

/**
 * Envía la notificación a todas las personas que reservaron mercancía y NO han pagado aún.
 */
function enviarNotificacionExtensionPago() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    'Confirmación de envío masivo',
    '¿Estás seguro de que deseas enviar el correo de extensión de pago a todos los registrados que tienen mercancía reservada y NO han pagado (Columna N no contiene "Si")?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Conferencia") || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var count = 0;

  for (var i = 1; i < data.length; i++) {
    var email = data[i][5]; // Columna F
    var ticketCode = data[i][2]; // Columna C
    var firstName = data[i][3]; // Columna D
    var lastName = data[i][4]; // Columna E
    var interestedInMerch = data[i][9]; // Columna J
    var merchItems = data[i][10]; // Columna K
    var merchTotal = Number(data[i][11] || 0); // Columna L
    var event = data[i][12] || ''; // Columna M
    var pago = String(data[i][13] || '').trim(); // Columna N

    var isConferencia = (event === "Conferencia Sin Filtros") && (ticketCode && ticketCode.indexOf("RESET") === -1);

    if (isConferencia && interestedInMerch === "Sí" && merchTotal > 0 && pago !== "Si" && email) {
      try {
        enviarCorreoNotificacionExtension({
          email: email.trim(),
          firstName: firstName,
          lastName: lastName,
          ticketCode: ticketCode,
          merchItems: merchItems,
          merchTotal: merchTotal
        });
        count++;
        Utilities.sleep(150); // Pausa prudente para respetar la cuota diaria de correos en Apps Script
      } catch (e) {
        console.error("Error enviando correo a " + email + ": " + e.toString());
      }
    }
  }

  ui.alert("Proceso completado", "Se han enviado " + count + " correos de notificación de extensión.", ui.ButtonSet.OK);
}

/**
 * Función encargada del diseño y envío del correo electrónico de extensión de pago.
 */
function enviarCorreoNotificacionExtension(data) {
  var email = data.email;
  var subject = "👕 ¡Aún estás a tiempo! Nueva fecha de pago para tu mercancía de Sin Filtros 2026";

  var ticketUrl = "https://ministeriodejovenesicc.netlify.app/ticket/" + data.ticketCode;
  var totalVal = "RD$ " + Number(data.merchTotal).toLocaleString();

  var theme = getEmailTheme(false, data.activeTheme);

  var htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="background-color: ${theme.outerBg}; color: #ffffff; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${theme.outerBg}; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="500" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: ${theme.cardBg}; border: 1px solid ${theme.cardBorderColor}; border-radius: 16px; padding: 32px; text-align: left;">
              <tr>
                <td align="center" style="padding-bottom: 24px; border-bottom: 1px solid ${theme.cardBorderColor};">
                  <div style="color: ${theme.textColorMuted}; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">Conferencia de Jóvenes ICC</div>
                  <div style="font-size: 24px; font-weight: 800; color: ${theme.headerColor}; letter-spacing: -0.5px;">SIN FILTROS 2026</div>
                  <div style="color: #666666; font-size: 13px; margin-top: 4px;">OneTwentyOne</div>
                </td>
              </tr>
              <tr>
                <td style="font-size: 15px; color: #dddddd; line-height: 1.6; padding: 24px 0 16px 0;">
                  ¡Hola <strong>${data.firstName}</strong>! 👋 ¡Que Dios te bendiga mucho!<br><br>
                  Pasamos por aquí para dejarte un saludito y darte una excelente noticia. Sabemos lo mucho que quieres tu mercancía de <strong>Sin Filtros 2026</strong> y queremos ponértela fácil para que no te quedes sin ella: <strong>¡hemos extendido el plazo de pago!</strong> 🥳<br><br>
                  Tienes hasta el <strong>domingo, 9 de agosto de 2026</strong> para completar tu pago y asegurar tus artículos. ¡Aprovecha estos días extras! 💻✨
                </td>
              </tr>
              <tr>
                <td>
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${theme.detailsBg}; border: 1px solid ${theme.detailsBorderColor}; border-radius: 12px; padding: 20px;">
                    <tr>
                      <td style="font-size: 11px; color: ${theme.textColorMuted}; padding-bottom: 2px;">Asistente</td>
                    </tr>
                    <tr>
                      <td style="font-size: 15px; font-weight: bold; color: #ffffff; padding-bottom: 12px;">${data.firstName} ${data.lastName}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 11px; color: ${theme.textColorMuted}; padding-bottom: 2px;">Código de Entrada / Boleto</td>
                    </tr>
                    <tr>
                      <td style="font-size: 16px; font-weight: bold; font-family: monospace; color: ${theme.textCodeColor}; padding-bottom: 12px; letter-spacing: 0.5px;">${data.ticketCode}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 11px; color: ${theme.textColorMuted}; padding-bottom: 2px;">Artículos Reservados</td>
                    </tr>
                    <tr>
                      <td style="font-size: 13px; color: #aaaaaa; padding-bottom: 12px; line-height: 1.4;">${data.merchItems}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 11px; color: ${theme.textColorMuted}; padding-bottom: 2px;">Total a Pagar (100%)</td>
                    </tr>
                    <tr>
                      <td style="font-size: 16px; font-weight: bold; color: #ffffff;">${totalVal}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding-top: 16px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #141414; border: 1px dashed ${theme.detailsBorderColor}; border-radius: 12px; padding: 20px;">
                    <tr>
                      <td style="font-size: 11px; color: #888888; line-height: 1.4;">
                        <strong>Instrucciones de Pago:</strong><br>
                        Deposita o transfiere el monto total e indica como concepto: <strong>${data.ticketCode} - ${data.firstName} ${data.lastName}</strong>.<br><br>
                        • <strong>Banreservas (Ahorro):</strong> <code>9607274318</code> &mdash; Joelmary Hernandez &mdash; Cédula: 402-3603056-1<br>
                        • <strong>Banco Popular (Corriente):</strong> <code>836288449</code> &mdash; David J. Chez &mdash; Cédula: 402-0037969-7<br><br>
                        Una vez realizado el pago, envía tu comprobante por WhatsApp para validar tu reserva:<br>
                        <a href="https://wa.me/18096299236?text=COMPROBANTE%20DE%20PAGO%20-%20REGISTRO%20CONFERENCIA%0A%0AAsistente%3A%20${encodeURIComponent(data.firstName + ' ' + data.lastName)}%0ACódigo%20de%20Boleto%3A%20${encodeURIComponent(data.ticketCode)}" target="_blank" style="color: ${theme.accentColorText}; font-weight: bold; text-decoration: underline;">Enviar comprobante por WhatsApp al (809) 629-9236</a>
                        <br><br>
                        <strong style="color: #f87171;">⚠️ Recordatorio importante:</strong><br>
                        Para poder coordinar la entrega de toda la mercancía a tiempo, después de esta fecha (9 de agosto) liberaremos los pedidos que no estén confirmados para que otros jóvenes puedan adquirirlos. ¡Bendiciones y gracias por tu comprensión! 🙌
                        <br><br>
                        <em>* Si ya realizaste tu pago y enviaste tu comprobante por WhatsApp, no te preocupes, ya lo estamos procesando. ¡Nos vemos pronto!</em>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding-top: 24px; font-size: 12px; color: ${theme.textColorMuted}; line-height: 1.5; border-top: 1px solid ${theme.cardBorderColor}; margin-top: 24px;">
                  Si tienes alguna duda o necesitas modificar tus datos de registro, escríbenos a nuestra cuenta de Instagram <a href="https://www.instagram.com/onetwentyoneicc" target="_blank" style="color: #ffffff; text-decoration: underline;">@onetwentyoneicc</a>.
                </td>
              </tr>
            </table>
            <table width="100%" max-width="500" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; text-align: center; margin-top: 20px;">
              <tr>
                <td style="font-size: 10px; color: #555555; line-height: 1.4;">
                  Este correo fue enviado automáticamente para notificar cambios en los plazos de pago.<br>
                  © 2026 Iglesia de Convertidos a Cristo. Todos los derechos reservados.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: htmlBody,
    name: "Sin Filtros 2026"
  });
}

/**
 * Envía una prueba del correo de invitación a la mercancía a kevito.valdez@gmail.com.
 */
function enviarCorreoPruebaInvitacionAdmin() {
  var sampleRecord = {
    firstName: "Kevin (Prueba)",
    lastName: "Valdez",
    ticketCode: "121-ICC-5727",
    email: "kevito.valdez@gmail.com"
  };

  enviarCorreoInvitacionMercancia(sampleRecord);
  SpreadsheetApp.getUi().alert("Correo de prueba de invitación enviado a kevito.valdez@gmail.com con el código de boleto: " + sampleRecord.ticketCode);
}

/**
 * Envía la invitación de mercancía a todas las personas que NO han reservado ni pagado nada (No interesados).
 */
function enviarNotificacionInvitacionMercancia() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    'Confirmación de envío masivo de invitación',
    '¿Estás seguro de que deseas enviar el correo de invitación de mercancía a todos los registrados que NO marcaron interés y tienen la columna de pago vacía (Columna J no es "Sí" y Columna N está vacía)?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Conferencia") || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var count = 0;

  for (var i = 1; i < data.length; i++) {
    var email = data[i][5]; // Columna F
    var ticketCode = data[i][2]; // Columna C
    var firstName = data[i][3]; // Columna D
    var lastName = data[i][4]; // Columna E
    var interestedInMerch = data[i][9]; // Columna J
    var event = data[i][12] || ''; // Columna M
    var pago = String(data[i][13] || '').trim(); // Columna N

    var isConferencia = (event === "Conferencia Sin Filtros") && (ticketCode && ticketCode.indexOf("RESET") === -1);

    // Condición: Es conferencia, no mostró interés en mercancía ("Sí") y la columna de pago está vacía, y tiene correo
    if (isConferencia && interestedInMerch !== "Sí" && pago === "" && email) {
      try {
        enviarCorreoInvitacionMercancia({
          email: email.trim(),
          firstName: firstName,
          lastName: lastName,
          ticketCode: ticketCode
        });
        count++;
        Utilities.sleep(150); // Pausa prudente para respetar la cuota diaria de correos en Apps Script
      } catch (e) {
        console.error("Error enviando correo de invitación a " + email + ": " + e.toString());
      }
    }
  }

  ui.alert("Proceso completado", "Se han enviado " + count + " correos de invitación de mercancía.", ui.ButtonSet.OK);
}

/**
 * Función encargada del diseño y envío del correo electrónico de invitación a la mercancía.
 */
function enviarCorreoInvitacionMercancia(data) {
  var email = data.email;
  var subject = "👕 ¡Completa tu outfit para Sin Filtros 2026! Mira la mercancía oficial disponible";

  var ticketUrl = "https://ministeriodejovenesicc.netlify.app/ticket/" + data.ticketCode;

  var theme = getEmailTheme(false, data.activeTheme);

  var htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="background-color: ${theme.outerBg}; color: #ffffff; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${theme.outerBg}; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="500" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: ${theme.cardBg}; border: 1px solid ${theme.cardBorderColor}; border-radius: 16px; padding: 32px; text-align: left;">
              <tr>
                <td align="center" style="padding-bottom: 24px; border-bottom: 1px solid ${theme.cardBorderColor};">
                  <div style="color: ${theme.textColorMuted}; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">Conferencia de Jóvenes ICC</div>
                  <div style="font-size: 24px; font-weight: 800; color: ${theme.headerColor}; letter-spacing: -0.5px;">SIN FILTROS 2026</div>
                  <div style="color: #666666; font-size: 13px; margin-top: 4px;">OneTwentyOne</div>
                </td>
              </tr>
              <tr>
                <td style="font-size: 15px; color: #dddddd; line-height: 1.6; padding: 24px 0 16px 0;">
                  ¡Hola <strong>${data.firstName}</strong>! 👋 ¡Que Dios te bendiga mucho!<br><br>
                  Esperamos que estés súper bien y con el corazón expectante para lo que viviremos en <strong>Sin Filtros 2026</strong>. ¡Ya falta muy poco! 🥳<br><br>
                  Pasamos por aquí para contarte que aún estás a tiempo de adquirir la <strong>mercancía oficial de la conferencia</strong> (t-shirts, gorras y más) para que vayas con el outfit completo. ¡Los diseños quedaron increíbles!<br><br>
                  Puedes ver el catálogo de artículos y hacer tu reserva directamente desde tu boleto digital haciendo clic en el botón de abajo:
                </td>
              </tr>
              <tr>
                <td align="center" style="padding: 16px 0 24px 0;">
                  <a href="${ticketUrl}" target="_blank" style="background-color: ${theme.accentColorText}; color: #000000; display: inline-block; padding: 14px 28px; font-weight: bold; border-radius: 8px; text-decoration: none; font-size: 15px; letter-spacing: 0.5px;">🛒 Ver Mercancía y Reservar</a>
                </td>
              </tr>
              <tr>
                <td style="font-size: 12px; color: ${theme.textColorMuted}; line-height: 1.5; padding: 20px; background-color: ${theme.detailsBg}; border: 1px dashed ${theme.detailsBorderColor}; border-radius: 12px;">
                  ⚠️ <strong>Nota importante:</strong> La fecha límite para realizar tu reserva y completar el pago es el <strong>domingo, 9 de agosto de 2026</strong>. Pasada esta fecha, cerraremos los pedidos de producción para garantizar que todo esté listo para el día del evento.<br><br>
                  ¡Bendiciones y nos vemos pronto! 🙌
                </td>
              </tr>
              <tr>
                <td style="padding-top: 24px; font-size: 12px; color: ${theme.textColorMuted}; line-height: 1.5; border-top: 1px solid ${theme.cardBorderColor}; margin-top: 24px;">
                  Si tienes alguna duda o necesitas asistencia, escríbenos a nuestra cuenta de Instagram <a href="https://www.instagram.com/onetwentyoneicc" target="_blank" style="color: #ffffff; text-decoration: underline;">@onetwentyoneicc</a>.
                </td>
              </tr>
            </table>
            <table width="100%" max-width="500" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; text-align: center; margin-top: 20px;">
              <tr>
                <td style="font-size: 10px; color: #555555; line-height: 1.4;">
                  Este correo fue enviado automáticamente por tu registro en la plataforma de OneTwentyOne.<br>
                  © 2026 Iglesia de Convertidos a Cristo. Todos los derechos reservados.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: htmlBody,
    name: "Sin Filtros 2026"
  });
}

/**
 * Envía una prueba del correo de confirmación de pago recibido a la mercancía a kevito.valdez@gmail.com.
 */
function enviarCorreoPruebaPagoConfirmadoAdmin() {
  var sampleRecord = {
    firstName: "Kevin (Prueba)",
    lastName: "Valdez",
    ticketCode: "121-ICC-5727",
    merchItems: "1x Gorra \"Sin Filtros\" - Negro, 1x Camiseta \"Sin Filtros\" - Negro (M)",
    merchTotal: 1950,
    email: "kevito.valdez@gmail.com"
  };

  enviarCorreoPagoConfirmado(sampleRecord);
  SpreadsheetApp.getUi().alert("Correo de prueba de confirmación de pago enviado a kevito.valdez@gmail.com con el código de boleto: " + sampleRecord.ticketCode);
}

/**
 * Envía la confirmación de pago recibido a todas las personas que ya pagaron (pago === "Si").
 */
function enviarNotificacionConfirmacionPago() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    'Confirmación de envío masivo de recibo de pago',
    '¿Estás seguro de que deseas enviar la confirmación de pago recibido a todos los registrados que tienen mercancía pagada (Columna N contiene "Si")?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Conferencia") || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var count = 0;

  for (var i = 1; i < data.length; i++) {
    var email = data[i][5]; // Columna F
    var ticketCode = data[i][2]; // Columna C
    var firstName = data[i][3]; // Columna D
    var lastName = data[i][4]; // Columna E
    var interestedInMerch = data[i][9]; // Columna J
    var merchItems = data[i][10]; // Columna K
    var merchTotal = Number(data[i][11] || 0); // Columna L
    var event = data[i][12] || ''; // Columna M
    var pago = String(data[i][13] || '').trim(); // Columna N

    var isConferencia = (event === "Conferencia Sin Filtros") && (ticketCode && ticketCode.indexOf("RESET") === -1);

    // Condición: Es conferencia, tiene mercancía y la columna de pago contiene "Si", y tiene correo
    if (isConferencia && interestedInMerch === "Sí" && pago.toLowerCase() === "si" && email) {
      try {
        enviarCorreoPagoConfirmado({
          email: email.trim(),
          firstName: firstName,
          lastName: lastName,
          ticketCode: ticketCode,
          merchItems: merchItems,
          merchTotal: merchTotal
        });
        count++;
        Utilities.sleep(150); // Pausa prudente para respetar la cuota diaria de correos en Apps Script
      } catch (e) {
        console.error("Error enviando confirmación de pago a " + email + ": " + e.toString());
      }
    }
  }

  ui.alert("Proceso completado", "Se han enviado " + count + " correos de confirmación de pago.", ui.ButtonSet.OK);
}

/**
 * Función encargada del diseño y envío del correo electrónico de confirmación de pago recibido.
 */
function enviarCorreoPagoConfirmado(data) {
  var email = data.email;
  var subject = "✅ ¡Pago Recibido! Tu mercancía para Sin Filtros 2026 está asegurada";

  var ticketUrl = "https://ministeriodejovenesicc.netlify.app/ticket/" + data.ticketCode;
  var totalVal = "RD$ " + Number(data.merchTotal).toLocaleString();

  var theme = getEmailTheme(false, data.activeTheme);

  var htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="background-color: ${theme.outerBg}; color: #ffffff; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${theme.outerBg}; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="500" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: ${theme.cardBg}; border: 1px solid ${theme.cardBorderColor}; border-radius: 16px; padding: 32px; text-align: left;">
              <tr>
                <td align="center" style="padding-bottom: 24px; border-bottom: 1px solid ${theme.cardBorderColor};">
                  <div style="color: ${theme.textColorMuted}; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">Conferencia de Jóvenes ICC</div>
                  <div style="font-size: 24px; font-weight: 800; color: ${theme.headerColor}; letter-spacing: -0.5px;">SIN FILTROS 2026</div>
                  <div style="color: #666666; font-size: 13px; margin-top: 4px;">OneTwentyOne</div>
                </td>
              </tr>
              <tr>
                <td style="font-size: 15px; color: #dddddd; line-height: 1.6; padding: 24px 0 16px 0;">
                  ¡Hola <strong>${data.firstName}</strong>! 👋 ¡Que Dios te bendiga mucho!<br><br>
                  Te escribimos para confirmarte que <strong>hemos recibido tu pago con éxito</strong> 💸. ¡Tu mercancía oficial de <strong>Sin Filtros 2026</strong> ya está asegurada y reservada al 100%! 🥳👕<br><br>
                  <strong>¿Qué sigue ahora?</strong><br>
                  No te preocupes por nada más. Estamos trabajando en la producción de los artículos. Tan pronto estén listos y disponibles para retirar en la iglesia, <strong>te estaremos avisando de inmediato por este correo y también por WhatsApp</strong> para indicarte cuándo y dónde pasar a buscarlos. 📱✨<br><br>
                  ¡Muchas gracias por tu compromiso y por completar tu pago a tiempo! Nos vemos muy pronto. 🙌
                </td>
              </tr>
              <tr>
                <td>
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${theme.detailsBg}; border: 1px solid ${theme.detailsBorderColor}; border-radius: 12px; padding: 20px;">
                    <tr>
                      <td style="font-size: 11px; color: ${theme.textColorMuted}; padding-bottom: 2px;">Asistente</td>
                    </tr>
                    <tr>
                      <td style="font-size: 15px; font-weight: bold; color: #ffffff; padding-bottom: 12px;">${data.firstName} ${data.lastName}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 11px; color: ${theme.textColorMuted}; padding-bottom: 2px;">Código de Entrada / Boleto</td>
                    </tr>
                    <tr>
                      <td style="font-size: 16px; font-weight: bold; font-family: monospace; color: ${theme.textCodeColor}; padding-bottom: 12px; letter-spacing: 0.5px;">${data.ticketCode}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 11px; color: ${theme.textColorMuted}; padding-bottom: 2px;">Artículos Pagados</td>
                    </tr>
                    <tr>
                      <td style="font-size: 13px; color: #aaaaaa; padding-bottom: 12px; line-height: 1.4;">${data.merchItems}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 11px; color: ${theme.textColorMuted}; padding-bottom: 2px;">Total Recibido</td>
                    </tr>
                    <tr>
                      <td style="font-size: 16px; font-weight: bold; color: #10b981;">${totalVal} (PAGADO)</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding: 24px 0 16px 0;">
                  <a href="${ticketUrl}" target="_blank" style="background-color: ${theme.accentColorText}; color: #000000; display: inline-block; padding: 12px 24px; font-weight: bold; border-radius: 8px; text-decoration: none; font-size: 14px;">🎫 Ver mi Boleto Digital</a>
                </td>
              </tr>
              <tr>
                <td style="padding-top: 24px; font-size: 12px; color: ${theme.textColorMuted}; line-height: 1.5; border-top: 1px solid ${theme.cardBorderColor}; margin-top: 24px;">
                  Si tienes alguna duda o necesitas asistencia, escríbenos a nuestra cuenta de Instagram <a href="https://www.instagram.com/onetwentyoneicc" target="_blank" style="color: #ffffff; text-decoration: underline;">@onetwentyoneicc</a>.
                </td>
              </tr>
            </table>
            <table width="100%" max-width="500" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; text-align: center; margin-top: 20px;">
              <tr>
                <td style="font-size: 10px; color: #555555; line-height: 1.4;">
                  Este correo fue enviado automáticamente para confirmar tu pago en la plataforma de OneTwentyOne.<br>
                  © 2026 Iglesia de Convertidos a Cristo. Todos los derechos reservados.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: htmlBody,
    name: "Sin Filtros 2026"
  });
}

/**
 * Retorna las variables de diseño para el correo según el evento y la fecha actual o el tema activo.
 */
function getEmailTheme(isVigilia, activeThemeOverride) {
  var now = new Date();
  var isAugust1st2026OrLater = now >= new Date(2026, 7, 1); // 0-indexed month: 7 = August
  var isAugust24th2026OrLater = now >= new Date(2026, 7, 24);

  var isOrange = activeThemeOverride === 'orange' || (!activeThemeOverride && isAugust24th2026OrLater);
  var isYellow = activeThemeOverride === 'yellow' || (!activeThemeOverride && isAugust1st2026OrLater && !isAugust24th2026OrLater);

  if (activeThemeOverride === 'classic') {
    isOrange = false;
    isYellow = false;
  }

  // Default Conferencia colors (Stage 1)
  var theme = {
    outerBg: "#000000",
    cardBg: "#0a0a0a",
    cardBorderColor: "#222222",
    detailsBg: "#111111",
    detailsBorderColor: "#333333",
    accentColorText: "#ffffff",
    textColorMuted: "#888888",
    textCodeColor: "#ffffff",
    headerColor: "#ffffff"
  };

  if (isVigilia) {
    theme.outerBg = "#030202";
    theme.cardBg = "#0b0a0a";
    theme.cardBorderColor = "#3c1910";
    theme.detailsBg = "#141110";
    theme.detailsBorderColor = "#542013";
    theme.accentColorText = "#FF3800";
    theme.textColorMuted = "#a69385";
    theme.textCodeColor = "#fddfd6";
    theme.headerColor = "#FF3800"; // RESET Red-Orange
  } else if (isOrange) {
    // Stage 3: Orange Theme
    theme.outerBg = "#030202"; // Negro PDF
    theme.cardBg = "#0b0a0a";
    theme.cardBorderColor = "#3c1910";
    theme.detailsBg = "#141110";
    theme.detailsBorderColor = "#542013";
    theme.accentColorText = "#FF3800"; // Naranja PDF
    theme.textColorMuted = "#a69385"; // Muted Crema/Silver
    theme.textCodeColor = "#E1D2BD"; // Crema PDF
    theme.headerColor = "#FF3800"; // Naranja PDF
  } else if (isYellow) {
    // Stage 2: Yellow Theme
    theme.outerBg = "#030202"; // Negro PDF
    theme.cardBg = "#0b0a09";
    theme.cardBorderColor = "#3c3310";
    theme.detailsBg = "#141310";
    theme.detailsBorderColor = "#544613";
    theme.accentColorText = "#F8C118"; // Amarillo PDF
    theme.textColorMuted = "#a6a085"; // Muted Crema/Silver
    theme.textCodeColor = "#E1D2BD"; // Crema PDF
    theme.headerColor = "#F8C118"; // Amarillo PDF
  }

  return theme;
}
