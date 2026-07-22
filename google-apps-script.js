/**
 * 1. RECIBIR DATOS POST (Registra al usuario respetando tu orden de columnas)
 */
function doPost(e) {
  try {
    var jsonString = e.postData.contents;
    var data = JSON.parse(jsonString);
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Si la acción es actualizar mercancía para un boleto existente
    if (data.action === 'updateMerch') {
      var codeToFind = data.ticketCode;
      if (!codeToFind) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Falta el código de boleto.' }))
          .setMimeType(ContentService.MimeType.JSON);
      }

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
        ticketUrl: data.ticketUrl || ("https://onetwentyone-icc.vercel.app/ticket/" + codeToFind)
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
    
    var now = new Date();
    var timezone = Session.getScriptTimeZone();
    var dateFormatted = Utilities.formatDate(now, timezone, "dd/MM/yyyy");
    var timeFormatted = Utilities.formatDate(now, timezone, "hh:mm:ss a");
    
    var rowData = [
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
      data.merchTotal || 0          // Total de Venta (Columna L)
    ];
    
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
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][2] === codeToFind) {
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
          ageGroup: data[i][8],
          interestedInMerch: data[i][9],
          merchItems: data[i][10],
          merchTotal: data[i][11]
        };
        
        return ContentService.createTextOutput(JSON.stringify(result))
          .setMimeType(ContentService.MimeType.JSON);
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
  
  var subject = "🎫 Tu Boleto de Entrada - Sin Filtros 2026";
  
  var ticketUrl = data.ticketUrl;
  if (!ticketUrl) {
    ticketUrl = "https://onetwentyone-icc.vercel.app/ticket/" + data.ticketCode;
  }
  
  var qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + encodeURIComponent(ticketUrl);
  
  var merchHtml = "";
  if (data.interestedInMerch === "Sí" && data.merchTotal > 0) {
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
                <strong style="color: #f87171;">⚠️ Fecha límite de pago: 01 de agosto de 2026.</strong><br>
                Por favor, completa tu pago a tiempo. Pasada esta fecha, las reservas no pagadas se cancelarán automáticamente y no podremos garantizar la disponibilidad de tus artículos.<br><br>
                <a href="https://wa.me/18096299236?text=COMPROBANTE%20DE%20PAGO%20-%20REGISTRO%20CONFERENCIA%0A%0AAsistente%3A%20${encodeURIComponent(data.firstName + ' ' + data.lastName)}%0ACódigo%20de%20Boleto%3A%20${encodeURIComponent(data.ticketCode)}" target="_blank" style="color: #ffffff; font-weight: bold; text-decoration: underline;">Enviar comprobante por WhatsApp al (809) 629-9236</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }

  var htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="background-color: #000000; color: #ffffff; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="500" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #0a0a0a; border: 1px solid #222222; border-radius: 16px; padding: 32px; text-align: left;">
              <tr>
                <td align="center" style="padding-bottom: 24px; border-bottom: 1px solid #222222;">
                  <div style="color: #888888; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">Conferencia de Jóvenes ICC</div>
                  <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">SIN FILTROS 2026</div>
                  <div style="color: #666666; font-size: 13px; margin-top: 4px;">OneTwentyOne</div>
                </td>
              </tr>
              <tr>
                <td style="font-size: 15px; color: #dddddd; line-height: 1.6; padding: 24px 0 16px 0;">
                  Hola <strong>${data.firstName}</strong>,<br><br>
                  ¡Tu registro para la conferencia de jóvenes <strong>Sin Filtros 2026</strong> ha sido completado con éxito!
                </td>
              </tr>
              <tr>
                <td>
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #111111; border: 1px solid #333333; border-radius: 12px; padding: 20px;">
                    <tr>
                      <td style="font-size: 11px; color: #888888; padding-bottom: 2px;">Asistente</td>
                    </tr>
                    <tr>
                      <td style="font-size: 15px; font-weight: bold; color: #ffffff; padding-bottom: 12px;">${data.firstName} ${data.lastName}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 11px; color: #888888; padding-bottom: 2px;">Código de Entrada</td>
                    </tr>
                    <tr>
                      <td style="font-size: 16px; font-weight: bold; font-family: monospace; color: #ffffff; padding-bottom: 12px; letter-spacing: 0.5px;">${data.ticketCode}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 11px; color: #888888; padding-bottom: 2px;">Fecha y Hora</td>
                    </tr>
                    <tr>
                      <td style="font-size: 14px; color: #ffffff; padding-bottom: 12px;">Sábado 29 Agosto, 2026 - 03:00 PM</td>
                    </tr>
                    <tr>
                      <td style="font-size: 11px; color: #888888; padding-bottom: 2px;">Lugar</td>
                    </tr>
                    <tr>
                      <td style="font-size: 13px; color: #ffffff; padding-bottom: 12px; line-height: 1.4;">
                        Iglesia de Convertidos a Cristo (ICC)<br>
                        C/ Dr. Núñez Domínguez #30, La Julia, Santo Domingo
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-top: 16px; border-top: 1px solid #222222;">
                        <img src="${qrCodeUrl}" alt="QR Entrada" width="150" height="150" style="border: 4px solid #ffffff; border-radius: 6px; display: block; margin: 0 auto;" />
                        <span style="font-size: 11px; color: #666666; display: block; margin-top: 8px; margin-bottom: 8px;">Presenta este código QR en la entrada</span>
                        <a href="${ticketUrl}" target="_blank" style="font-size: 13px; color: #ffffff; font-weight: bold; text-decoration: underline; display: block;">Ver mi Boleto en Línea</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              ${merchHtml}
              <tr>
                <td style="padding-top: 24px; font-size: 12px; color: #888888; line-height: 1.5; border-top: 1px solid #222222; margin-top: 24px;">
                  Si tienes alguna duda o necesitas modificar tus datos de registro, escríbenos a nuestra cuenta de Instagram <a href="https://instagram.com/onetwentyone.icc" target="_blank" style="color: #ffffff; text-decoration: underline;">@onetwentyone.icc</a>.
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
  
  console.log("Correo enviado con éxito.");
}

/**
 * 4. FUNCIÓN AUXILIAR PARA FORZAR PERMISOS
 */
function probarPermisos() {
  MailApp.sendEmail(Session.getActiveUser().getEmail(), "Prueba de Permisos", "Si lees esto, los permisos están activos.");
}
