/**
 * 1. RECIBIR DATOS POST (Registra al usuario respetando tu orden de columnas)
 */
function doPost(e) {
  try {
    var jsonString = e.postData.contents;
    var data = JSON.parse(jsonString);

    var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    // Si la acción es registrar/actualizar pre-orden de comida
    if (data.action === 'preorderFood') {
      var codeToFind = data.ticketCode;
      if (!codeToFind) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Falta el código de boleto.' }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      var confSheet = activeSpreadsheet.getSheetByName("Conferencia") || activeSpreadsheet.getActiveSheet();
      var confValues = confSheet.getDataRange().getValues();
      var foundUser = null;

      for (var i = 1; i < confValues.length; i++) {
        if (String(confValues[i][2]).trim() === String(codeToFind).trim()) {
          foundUser = {
            firstName: confValues[i][3],
            lastName: confValues[i][4],
            email: confValues[i][5],
            phone: confValues[i][6]
          };
          break;
        }
      }

      if (!foundUser) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'not_found', message: 'Código de boleto no encontrado en los registros de la Conferencia.' }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      var foodSheet = activeSpreadsheet.getSheetByName("Pre-ordenes Menú");
      if (!foodSheet) {
        foodSheet = activeSpreadsheet.insertSheet("Pre-ordenes Menú");
        var headers = [
          "Fecha", "Hora", "Código de Boleto", "Nombre", "Apellido", "Correo", "Teléfono",
          "Negocio", "Detalle del Pedido", "Total (RD$)"
        ];
        foodSheet.appendRow(headers);
      }

      var now = new Date();
      var timezone = Session.getScriptTimeZone();
      var dateFormatted = Utilities.formatDate(now, timezone, "dd/MM/yyyy");
      var timeFormatted = Utilities.formatDate(now, timezone, "hh:mm:ss a");

      // Extract per-vendor data from vendorBreakdowns
      var vendorBreakdowns = data.vendorBreakdowns || [];

      // Fallback: if no breakdown, create one entry with combined data
      if (vendorBreakdowns.length === 0 && data.preorderDetails) {
        vendorBreakdowns = [{ vendorName: "General", details: data.preorderDetails, subtotal: data.totalEstimated || 0 }];
      }

      // For each vendor, write or update ONE row in the sheet (keyed by ticket + vendorName)
      var existingValues = foodSheet.getDataRange().getValues();

      for (var vb = 0; vb < vendorBreakdowns.length; vb++) {
        var vbEntry = vendorBreakdowns[vb];
        var foundRowIndex = -1;

        // Look for an existing row for this ticket + vendor
        for (var j = 1; j < existingValues.length; j++) {
          var rowTicket = String(existingValues[j][2]).trim();
          var rowVendor = String(existingValues[j][7]).trim();
          if (rowTicket === String(codeToFind).trim() && rowVendor === vbEntry.vendorName) {
            foundRowIndex = j + 1;
            break;
          }
        }

        var rowData = [
          dateFormatted,
          timeFormatted,
          codeToFind,
          foundUser.firstName,
          foundUser.lastName,
          foundUser.email,
          foundUser.phone,
          vbEntry.vendorName,
          vbEntry.details || "Ninguno",
          vbEntry.subtotal || 0
        ];

        if (foundRowIndex !== -1) {
          foodSheet.getRange(foundRowIndex, 1, 1, rowData.length).setValues([rowData]);
        } else {
          foodSheet.appendRow(rowData);
          // Update existingValues cache to avoid duplicate appends in same run
          existingValues.push(rowData);
        }
      }

      // Send ONE confirmation email with full breakdown grouped by vendor
      try {
        enviarCorreoPreordenComida({
          email: foundUser.email,
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
          ticketCode: codeToFind,
          preorderDetails: data.preorderDetails,
          vendorBreakdowns: vendorBreakdowns,
          totalEstimated: data.totalEstimated,
          activeTheme: data.activeTheme
        });
      } catch (emailError) {
        console.error("Error al enviar correo de confirmación de menú: " + emailError.toString());
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Tu orden ha sido registrada correctamente.'
      })).setMimeType(ContentService.MimeType.JSON);
    }

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

    // Si la acción es confirmar asistencia (pre-evento)
    if (data.action === 'confirmAttendance') {
      var ticketCode = data.ticketCode;
      var attending = data.attending; // "Si" o "No"
      
      var sheet = activeSpreadsheet.getSheetByName("Conferencia") || activeSpreadsheet.getActiveSheet();
      
      var values = sheet.getDataRange().getValues();
      var foundRowIndex = -1;
      
      for (var i = 1; i < values.length; i++) {
        if (String(values[i][2]).trim() === String(ticketCode).trim()) {
          foundRowIndex = i + 1;
          break;
        }
      }
      
      if (foundRowIndex !== -1) {
        // Escribir "Si" o "No" en la columna P (Columna 16)
        sheet.getRange(foundRowIndex, 16).setValue(attending);
        SpreadsheetApp.flush();
        return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Asistencia guardada" }))
                             .setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Boleto no encontrado" }))
                             .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Si la acción es check-in de llegada en puerta (día del evento)
    if (data.action === 'checkin') {
      var ticketCode = data.ticketCode;
      
      var sheet = activeSpreadsheet.getSheetByName("Conferencia") || activeSpreadsheet.getActiveSheet();
      
      var values = sheet.getDataRange().getValues();
      var foundRowIndex = -1;
      
      for (var i = 1; i < values.length; i++) {
        if (String(values[i][2]).trim() === String(ticketCode).trim()) {
          foundRowIndex = i + 1;
          break;
        }
      }
      
      if (foundRowIndex !== -1) {
        // Escribir "Si" y la hora en la columna R (Columna 18)
        var nowStr = new Date().toLocaleTimeString();
        sheet.getRange(foundRowIndex, 18).setValue("Si (" + nowStr + ")");
        SpreadsheetApp.flush();
        return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Entrada registrada" }))
                             .setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Boleto no encontrado" }))
                             .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Si la acción es auto-registro express en puerta (día del evento, no envía correo)
    if (data.action === 'expressCheckin') {
      var sheet = activeSpreadsheet.getSheetByName("Conferencia") || activeSpreadsheet.getActiveSheet();
      var now = new Date();
      var timezone = Session.getScriptTimeZone();
      var dateFormatted = Utilities.formatDate(now, timezone, "dd/MM/yyyy");
      var timeFormatted = Utilities.formatDate(now, timezone, "hh:mm:ss a");

      var ticketCode = data.ticketCode;
      if (!ticketCode) {
        var randomDigits = Math.floor(1000 + Math.random() * 9000);
        ticketCode = "121-ICC-" + randomDigits;
      }

      var rowData = [
        dateFormatted,                // A: Fecha
        timeFormatted,                // B: Hora
        ticketCode,                   // C: Boleto
        data.firstName || "",         // D: Nombre
        data.lastName || "",          // E: Apellido
        data.email || "",             // F: Correo
        data.phone || "",             // G: Teléfono
        data.church || "Invitado",    // H: Iglesia
        data.ageGroup || "18 a 25",   // I: Rango de edad
        "No",                         // J: Interés en mercancía
        "Ninguno",                    // K: Artículos
        0,                            // L: Total mercancía
        "Conferencia Sin Filtros",    // M: Evento
        "",                           // N
        "Registro en Check-in",       // O: Notas / Comentarios
        "Si",                         // P: Asistencia confirmada
        "Registro en Puerta",         // Q: Envío
        "Si (" + timeFormatted + ")"  // R: Check-in entrada
      ];

      sheet.appendRow(rowData);
      SpreadsheetApp.flush();

      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        message: "Registro y entrada completados con éxito",
        ticketCode: ticketCode
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Si la acción es sincronización masiva en lote (batchCheckin a las 9 PM o programado)
    if (data.action === 'batchCheckin') {
      var sheet = activeSpreadsheet.getSheetByName("Conferencia") || activeSpreadsheet.getActiveSheet();
      var values = sheet.getDataRange().getValues();
      var checkinsMap = {};
      
      // data.checkins: array of { ticketCode: string, checkedInAt?: string } o array de strings
      if (data.checkins && Array.isArray(data.checkins)) {
        for (var c = 0; c < data.checkins.length; c++) {
          var item = data.checkins[c];
          var code = typeof item === 'string' ? item : item.ticketCode;
          var timeStr = (typeof item === 'object' && item.checkedInAt) ? item.checkedInAt : new Date().toLocaleTimeString();
          if (code) {
            checkinsMap[code.trim()] = timeStr;
          }
        }
      }
      
      // Actualizar los checkins existentes en columna R (18)
      for (var i = 1; i < values.length; i++) {
        var rowCode = String(values[i][2]).trim();
        if (checkinsMap[rowCode]) {
          var mark = "Si (" + checkinsMap[rowCode] + ")";
          sheet.getRange(i + 1, 18).setValue(mark);
        }
      }
      
      // Agregar nuevos registros express (expressRegistrations: array)
      if (data.expressRegistrations && Array.isArray(data.expressRegistrations)) {
        var now = new Date();
        var timezone = Session.getScriptTimeZone();
        var dateFormatted = Utilities.formatDate(now, timezone, "dd/MM/yyyy");
        var timeFormatted = Utilities.formatDate(now, timezone, "hh:mm:ss a");
        
        for (var r = 0; r < data.expressRegistrations.length; r++) {
          var reg = data.expressRegistrations[r];
          var newTicket = reg.ticketCode || ("121-ICC-" + Math.floor(1000 + Math.random() * 9000));
          var rowData = [
            reg.date || dateFormatted,
            reg.time || timeFormatted,
            newTicket,
            reg.firstName || "",
            reg.lastName || "",
            reg.email || "",
            reg.phone || "",
            reg.church || "Invitado / En Puerta",
            reg.ageGroup || "18 a 25",
            "No",
            "Ninguno",
            0,
            "Conferencia Sin Filtros",
            "",
            "Registro en Check-in Local",
            "Si",
            "Registro en Puerta",
            "Si (" + (reg.time || timeFormatted) + ")"
          ];
          sheet.appendRow(rowData);
        }
      }
      
      SpreadsheetApp.flush();
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        message: "Sincronización en lote completada con éxito." 
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
    var rowUpdated = false;

    if (isCena) {
      // Si el participante confirma a través del enlace de 1 Clic enviado a su correo,
      // actualizamos su fila existente de Pre-Registro en vez de duplicarla.
      var esConfirmacionPrefill = data.isPrefillConfirmation === true || data.isPrefill === true;

      if (esConfirmacionPrefill) {
        var existingData = sheet.getDataRange().getValues();
        var targetEmail = data.email ? String(data.email).trim().toLowerCase() : "";

        for (var r = 1; r < existingData.length; r++) {
          var rowEmail = existingData[r][5] ? String(existingData[r][5]).trim().toLowerCase() : "";
          if (targetEmail && rowEmail === targetEmail) {
            var rowNum = r + 1;

            // Actualizar datos personales en su misma fila por si los modificó
            if (data.firstName) sheet.getRange(rowNum, 4).setValue(data.firstName);
            if (data.lastName) sheet.getRange(rowNum, 5).setValue(data.lastName);
            if (data.phone) sheet.getRange(rowNum, 7).setValue(data.phone);
            if (data.church) sheet.getRange(rowNum, 8).setValue(data.church);
            if (data.ageGroup) sheet.getRange(rowNum, 9).setValue(data.ageGroup);

            // Marcar fila como confirmada
            sheet.getRange(rowNum, 3).setValue("REGISTRO-CENA");
            sheet.getRange(rowNum, 10).setValue(data.event || 'Cena de Jóvenes ICC 2026');
            sheet.getRange(rowNum, 11).setValue("Registro Confirmado (1-Clic - " + dateFormatted + " " + timeFormatted + ")");

            rowUpdated = true;
            break;
          }
        }
      }

      // Si no fue por el enlace de prefill o no se encontró en la hoja, se prepara fila para inserción normal
      rowData = [
        dateFormatted,                // Fecha (Columna A)
        timeFormatted,                // Hora (Columna B)
        "REGISTRO-CENA",              // Referencia sin boleto (Columna C)
        data.firstName,               // Nombre (Columna D)
        data.lastName,                // Apellido (Columna E)
        data.email,                   // Correo (Columna F)
        data.phone,                   // Teléfono (Columna G)
        data.church,                  // Iglesia (Columna H)
        data.ageGroup,                // Rango de Edad (Columna I)
        data.event || 'Cena de Jóvenes ICC 2026', // Nombre del Evento (Columna J)
        "Registro Directo Enviado"    // Estado de Notificación (Columna K)
      ];
    } else if (isVigilia || isCampamento) {
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
        data.event || (isCampamento ? 'Campamento de Jóvenes ICC 2027' : 'Media Vigilia RESET') // Nombre del Evento (Columna J)
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

    // Si no se actualizó una fila existente de pre-registro, se agrega una nueva fila
    if (!rowUpdated) {
      sheet.appendRow(rowData);
    }

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
 * 2. RECIBIR CONSULTA GET (Busca un boleto por código en la columna C o devuelve todos para local-first)
 */
function doGet(e) {
  try {
    // 0. Caso de Obtener todos los asistentes para modo local ultra-rápido
    if (e.parameter.action === 'getAllAttendees' || e.parameter.getAll === 'true') {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Conferencia") || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      var data = sheet.getDataRange().getValues();
      var attendees = [];
      
      for (var i = 1; i < data.length; i++) {
        var ticketCode = data[i][2] ? data[i][2].toString().trim() : "";
        var firstName = data[i][3] ? data[i][3].toString().trim() : "";
        var lastName = data[i][4] ? data[i][4].toString().trim() : "";
        var email = data[i][5] ? data[i][5].toString().trim() : "";
        var church = data[i][7] ? data[i][7].toString().trim() : "";
        var ageGroup = data[i][8] ? data[i][8].toString().trim() : "";
        var event = data[i][12] ? data[i][12].toString().trim() : '';
        
        var isConferencia = (event === "Conferencia Sin Filtros" || !event) && (ticketCode && ticketCode.indexOf("RESET") === -1 && ticketCode.indexOf("CENA") === -1 && ticketCode.indexOf("CAMP") === -1);
        
        if (ticketCode && isConferencia) {
          var checkedInVal = data[i][17] ? data[i][17].toString().trim() : "No";
          var isChecked = (checkedInVal !== "" && checkedInVal.toLowerCase() !== "no");
          
          attendees.push({
            ticketCode: ticketCode,
            firstName: firstName,
            lastName: lastName,
            email: email,
            church: church,
            ageGroup: ageGroup,
            checkedIn: isChecked ? "Si" : "No"
          });
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', attendees: attendees }))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    // 1. Caso de Búsqueda por Nombre, Correo o Código (Auto-registro de Entrada check-in)
    var query = e.parameter.query;
    if (query) {
      var searchStr = query.toString().trim().toLowerCase();
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Conferencia") || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      var data = sheet.getDataRange().getValues();
      var results = [];
      
      for (var i = 1; i < data.length; i++) {
        var ticketCode = data[i][2] ? data[i][2].toString() : "";
        var firstName = data[i][3] ? data[i][3].toString() : "";
        var lastName = data[i][4] ? data[i][4].toString() : "";
        var email = data[i][5] ? data[i][5].toString() : "";
        var event = data[i][12] || '';
        
        var fullName = (firstName + " " + lastName).toLowerCase();
        var isConferencia = (event === "Conferencia Sin Filtros") && (ticketCode && ticketCode.indexOf("RESET") === -1);
        
        if (isConferencia && (fullName.indexOf(searchStr) !== -1 || 
            ticketCode.toLowerCase().indexOf(searchStr) !== -1 || 
            email.toLowerCase().indexOf(searchStr) !== -1)) {
          
          var checkedIn = data[i][17] ? data[i][17].toString().trim() : "No"; // Columna R (Columna 18)
          if (checkedIn === "" || checkedIn.toLowerCase() === "no") {
            checkedIn = "No";
          } else {
            checkedIn = "Si";
          }
          
          results.push({
            firstName: firstName,
            lastName: lastName,
            email: maskEmailForSearch(email),
            ticketCode: ticketCode,
            checkedIn: checkedIn
          });
          
          if (results.length >= 10) break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', results: results }))
                           .setMimeType(ContentService.MimeType.JSON);
    }

    var codeToFind = e.parameter.code;
    if (!codeToFind) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Falta el código de boleto o consulta de búsqueda' }))
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
 * Función auxiliar para enmascarar el correo en búsquedas públicas
 */
function maskEmailForSearch(email) {
  if (!email) return "";
  var parts = email.split("@");
  if (parts.length < 2) return "***";
  var name = parts[0];
  var domain = parts[1];
  if (name.length <= 2) return "**@" + domain;
  return name.substring(0, 2) + "***@" + domain;
}


/**
 * Función auxiliar para enmascarar el correo en búsquedas públicas
 */
function maskEmailForSearch(email) {
  if (!email) return "";
  var parts = email.split("@");
  if (parts.length < 2) return "***";
  var name = parts[0];
  var domain = parts[1];
  if (name.length <= 2) return "**@" + domain;
  return name.substring(0, 2) + "***@" + domain;
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

  // La Cena de Jóvenes 2026 no requiere boleto ni QR; usa su propia plantilla con costos y cuentas ICC
  if (isCena) {
    enviarCorreoRegistroCena(data, false);
    return;
  }

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
                        Iglesia De Convertidos a Cristo (ICC)<br>
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
                  © 2026 Iglesia De Convertidos a Cristo. Todos los derechos reservados.
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
/**
 * Retorna las variables de diseño para el correo según el evento y la fecha actual o el tema activo.
 */
function getEmailTheme(isVigilia, activeThemeOverride) {
  var now = new Date();
  var isAugust1st2026OrLater = now >= new Date(2026, 7, 1);
  var isAugust24th2026OrLater = now >= new Date(2026, 7, 24);

  var isOrange = activeThemeOverride === 'orange' || (!activeThemeOverride && isAugust24th2026OrLater);
  var isYellow = activeThemeOverride === 'yellow' || (!activeThemeOverride && isAugust1st2026OrLater && !isAugust24th2026OrLater);

  if (activeThemeOverride === 'classic') {
    isOrange = false;
    isYellow = false;
  }

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
    theme.headerColor = "#FF3800";
  } else if (isOrange) {
    theme.outerBg = "#030202";
    theme.cardBg = "#0b0a0a";
    theme.cardBorderColor = "#3c1910";
    theme.detailsBg = "#141110";
    theme.detailsBorderColor = "#542013";
    theme.accentColorText = "#FF3800";
    theme.textColorMuted = "#a69385";
    theme.textCodeColor = "#E1D2BD";
    theme.headerColor = "#FF3800";
  } else if (isYellow) {
    theme.outerBg = "#030202";
    theme.cardBg = "#0b0a09";
    theme.cardBorderColor = "#3c3310";
    theme.detailsBg = "#141310";
    theme.detailsBorderColor = "#544613";
    theme.accentColorText = "#F8C118";
    theme.textColorMuted = "#a6a085";
    theme.textCodeColor = "#E1D2BD";
    theme.headerColor = "#F8C118";
  }

  return theme;
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

  // Submenú de pruebas para Cena de Jóvenes 2026
  var pruebasCenaMenu = ui.createMenu('Pruebas')
    .addItem('1. Enviar Prueba: Primer Envío (Inscripciones Abiertas)', 'enviarPruebaCenaPreRegistrados')
    .addItem('2. Enviar Prueba: Segundo Envío / Paso Final (Título Diferente)', 'enviarPruebaCenaSegundoMensaje')
    .addItem('3. Enviar Prueba: Confirmación de Nuevo Registro', 'enviarPruebaCenaNuevoRegistro')
    .addSeparator()
    .addItem('📊 Consultar correos restantes hoy', 'consultarCorreosRestantes');

  // Menú principal de Cena de Jóvenes 2026
  var cenaMenu = ui.createMenu('Cena de Jóvenes 2026')
    .addItem('1. Enviar Masivo: Info de Registro y Pago a Pre-Registrados', 'enviarMasivoCenaPreRegistrados')
    .addSeparator()
    .addSubMenu(pruebasCenaMenu);

  // Registrar el menú principal en la interfaz
  ui.createMenu('OneTwentyOne - Admin')
    .addSubMenu(cenaMenu)
    .addSeparator()
    .addItem('📊 Consultar correos restantes hoy', 'consultarCorreosRestantes')
    .addItem('⚙️ Probar permisos de correo', 'probarPermisos')
    .addToUi();
}

/**
 * Envía el correo de la Cena de Jóvenes 2026 ("Christmas x Grace") SIN boleto ni QR,
 * incluyendo el afiche oficial, costo de RD$ 350 p/p y cuentas bancarias de ICC
 * (omitiendo la cuenta de ahorros del Banco Popular).
 * 
 * @param {Object} data - Datos del participante (firstName, lastName, email, phone, church, ageGroup, isReenvio)
 * @param {boolean} isPreRegistrado - true si es para alguien que ya hizo el Pre-Registro; false si acaba de registrarse
 * @param {boolean} [isReenvio] - true si ya se le había enviado un primer correo previamente (aplica título y mensaje diferenciados)
 */
function enviarCorreoRegistroCena(data, isPreRegistrado, isReenvio) {
  var email = data.email;
  var firstName = data.firstName || "Joven";
  var lastName = data.lastName || "";
  var fullName = (firstName + " " + lastName).trim();
  var phone = data.phone || "";
  var church = data.church || "Iglesia De Convertidos a Cristo";
  var ageGroup = data.ageGroup || "";
  var esSegundoEnvio = isReenvio || data.isReenvio || false;

  var subject = isPreRegistrado
    ? (esSegundoEnvio
        ? "🎄 Paso Final: Confirma tu Registro Oficial en 1 Clic - Cena de Jóvenes 2026 (Christmas x Grace)"
        : "🎄 ¡Inscripciones Abiertas! Confirma tu Registro Oficial en 1 Clic - Cena de Jóvenes 2026 (Christmas x Grace)")
    : "🎄 ¡Registro Confirmado! - Cena de Jóvenes ICC 2026 (Christmas x Grace)";

  var flyerUrl = "https://ministeriodejovenesicc.netlify.app/cena-jovenes-2026.jpeg";

  // Enlace con parámetros de pre-rellenado para confirmación automática en 1 clic
  var prefillParams = [
    "event=cena",
    "prefill=1",
    "fn=" + encodeURIComponent(firstName),
    "ln=" + encodeURIComponent(lastName),
    "em=" + encodeURIComponent(email),
    "ph=" + encodeURIComponent(phone),
    "ch=" + encodeURIComponent(church),
    "ag=" + encodeURIComponent(ageGroup)
  ].join("&");
  var prefillUrl = "https://ministeriodejovenesicc.netlify.app/registro?" + prefillParams + "#confirmar";
  var registroUrl = isPreRegistrado ? prefillUrl : "https://ministeriodejovenesicc.netlify.app/registro?event=cena";
  var copiarDatosUrl = "https://ministeriodejovenesicc.netlify.app/registro?event=cena&copy=datos";
  var googleMapsUrl = "https://maps.app.goo.gl/Fu3FiZrv18pzMzdU6";
  var mailtoSubject = encodeURIComponent("Comprobante de Pago - Cena de Jóvenes 2026 - " + fullName);
  var mailtoBody = encodeURIComponent(
    "Hola, bendiciones.\n\nAdjunto el comprobante de pago de la Cena de Jóvenes 2026 (\"Christmas x Grace\" - RD$ 350 p/p).\n\n• Participante: " + fullName + "\n• Actividad: Cena de Jóvenes ICC 2026\n• Monto: RD$ 350\n\n¡Muchas gracias!"
  );
  var mailtoPagoUrl = "mailto:secretaria@convertidosacristo.org?subject=" + mailtoSubject + "&body=" + mailtoBody;

  var introHtml = isPreRegistrado
    ? (esSegundoEnvio
        ? `¡Hola <strong>${firstName}</strong>! 👋 ¡Que Dios te bendiga mucho!<br><br>
           Te escribimos nuevamente para compartirte un <strong>enlace directo de confirmación en 1 solo clic</strong> para nuestra <strong>Cena de Jóvenes ICC 2026: "Christmas x Grace" (Siervos x Jotapece)</strong>. 🎉<br><br>
           Como ya habías realizado tu Pre-Registro, tus datos están listos en la web para que puedas formalizar tu inscripción oficial sin tener que escribir nada manualmente. Te recordamos que <strong>esta cena NO requerirá boleto físico de entrada</strong>. A continuación puedes confirmar tu registro en 1 clic y ver las cuentas bancarias para tu pago:`
        : `¡Hola <strong>${firstName}</strong>! 👋 ¡Que Dios te bendiga mucho!<br><br>
           Te escribimos porque realizaste tu <strong>Pre-Registro</strong> para nuestra esperada <strong>Cena de Jóvenes ICC 2026: "Christmas x Grace" (Siervos x Jotapece)</strong>. 🎉<br><br>
           ¡Ya están abiertas las inscripciones oficiales! Te informamos que <strong>esta cena NO requerirá ningún tipo de boleto o ticket de entrada</strong>. Para facilitarte todo, hemos preparado un enlace con tus datos listos para que confirmes tu registro en 1 solo clic. A continuación te compartimos toda la información necesaria, el costo oficial y las cuentas bancarias de la iglesia:`)
    : `¡Hola <strong>${firstName}</strong>! 👋 ¡Que Dios te bendiga mucho!<br><br>
       ¡Hemos recibido con éxito tu registro para nuestra <strong>Cena de Jóvenes ICC 2026: "Christmas x Grace" (Siervos x Jotapece)</strong>! 🎉<br><br>
       Te recordamos que <strong>esta actividad NO requiere ningún tipo de boleto o ticket de entrada</strong>; tus datos ya han quedado anotados en nuestra lista oficial de participantes.<br><br>
       A continuación te compartimos el resumen de la actividad y las cuentas bancarias oficiales de la iglesia para realizar tu pago:`;

  // Botón superior destacado para confirmación en 1 clic
  var preRegTopCtaHtml = isPreRegistrado
    ? `<tr>
         <td style="padding: 10px 0 20px 0;">
           <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #122c1e; border: 2px solid #ef4444; border-radius: 14px; padding: 20px; text-align: center;">
             <tr>
               <td align="center">
                 <div style="color: #86efac; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; margin-bottom: 6px;">
                   ${esSegundoEnvio ? "✨ ENLACE DIRECTO DE CONFIRMACIÓN" : "✨ TUS DATOS DEL PRE-REGISTRO YA ESTÁN LISTOS"}
                 </div>
                 <div style="color: #ffffff; font-size: 17px; font-weight: 800; margin-bottom: 8px;">
                   ¡Confirma tu cupo oficial con 1 solo clic!
                 </div>
                 <div style="color: #d1fae5; font-size: 13px; line-height: 1.5; margin-bottom: 16px; max-width: 440px;">
                   ${esSegundoEnvio
                     ? "Tus datos del pre-registro ya están cargados. Solo haz clic en el botón de abajo para asegurar tu lugar sin tener que volver a escribir nada:"
                     : "Para facilitarte todo, hemos preparado este enlace con tus datos ya cargados. Toca el botón y confirma tu registro sin volver a escribir nada manualmente:"}
                 </div>
                 <a href="${prefillUrl}" target="_blank" style="background-color: #ef4444; color: #ffffff; display: inline-block; padding: 15px 30px; font-weight: 900; border-radius: 50px; text-decoration: none; font-size: 15px; letter-spacing: 0.3px; box-shadow: 0 4px 16px rgba(239, 68, 68, 0.45);">
                   🎄 Confirmar Mi Registro en 1 Clic
                 </a>
                 <div style="color: #9ca3af; font-size: 11px; margin-top: 10px;">
                   (Te llevará a la página oficial con tu formulario ya completado para confirmar)
                 </div>
               </td>
             </tr>
           </table>
         </td>
       </tr>`
    : "";

  var preRegButtonHtml = isPreRegistrado
    ? `<tr>
         <td align="center" style="padding: 20px 0 8px 0;">
           <a href="${prefillUrl}" target="_blank" style="background-color: #ef4444; color: #ffffff; display: inline-block; padding: 14px 28px; font-weight: 800; border-radius: 50px; text-decoration: none; font-size: 14px; letter-spacing: 0.4px;">
             🎄 Ir a Confirmar Registro Oficial con mis Datos
           </a>
         </td>
       </tr>`
    : "";

  var htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="background-color: #07140d; color: #ffffff; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #07140d; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="520" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #0d2116; border: 1px solid #1f4731; border-radius: 16px; padding: 32px; text-align: left;">
              <tr>
                <td align="center" style="padding-bottom: 24px; border-bottom: 1px solid #1f4731;">
                  <div style="color: #86efac; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">Siervos x Jotapece · Jóvenes ICC</div>
                  <div style="font-size: 26px; font-weight: 900; color: #ef4444; letter-spacing: -0.5px;">CHRISTMAS x GRACE</div>
                  <div style="color: #d1fae5; font-size: 13px; margin-top: 4px; font-weight: 600;">Cena de Jóvenes 2026</div>
                </td>
              </tr>

              <!-- Flyer Oficial de la Cena de Jóvenes -->
              <tr>
                <td align="center" style="padding-top: 24px;">
                  <img src="${flyerUrl}" alt="Cena de Jóvenes 2026 - Christmas x Grace" style="width: 100%; max-width: 100%; height: auto; border-radius: 12px; border: 1px solid #1f4731; display: block;" />
                </td>
              </tr>

              <!-- Mensaje de Bienvenida / Notificación -->
              <tr>
                <td style="font-size: 15px; color: #e5e7eb; line-height: 1.6; padding: 24px 0 16px 0;">
                  ${introHtml}
                </td>
              </tr>

              ${preRegTopCtaHtml}

              <!-- Resumen del Evento (Sin Boleto / Sin QR) -->
              <tr>
                <td>
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #122c1e; border: 1px solid #235338; border-radius: 12px; padding: 20px;">
                    <tr>
                      <td style="font-size: 11px; color: #86efac; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 2px;">Participante</td>
                    </tr>
                    <tr>
                      <td style="font-size: 16px; font-weight: bold; color: #ffffff; padding-bottom: 12px;">${fullName}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 11px; color: #86efac; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 2px;">Fecha y Hora</td>
                    </tr>
                    <tr>
                      <td style="font-size: 14px; color: #ffffff; font-weight: 600; padding-bottom: 12px;">Sábado 05 de Diciembre, 2026 &mdash; 07:00 PM</td>
                    </tr>
                    <tr>
                      <td style="font-size: 11px; color: #86efac; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 2px;">Costo por Persona</td>
                    </tr>
                    <tr>
                      <td style="font-size: 20px; font-weight: 900; color: #ef4444; padding-bottom: 12px;">RD$ 350 P/P</td>
                    </tr>
                    <tr>
                      <td style="font-size: 11px; color: #86efac; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 2px;">Código de Vestimenta</td>
                    </tr>
                    <tr>
                      <td style="font-size: 13px; color: #fde047; font-weight: 700; padding-bottom: 12px; line-height: 1.6;">
                        👗 Código de vestimenta: ¡Tu pijama favorita!<br>
                        <span style="color: #e5e7eb; font-weight: normal; font-size: 12.5px;">
                          Para mantener un ambiente familiar, cómodo y respetuoso, te pedimos que tu pijama sea modesta (pantalones largos o tipo pants y camisetas holgadas).<br><br>
                          <strong style="color: #fca5a5;">🚫 Qué NO se debe llevar:</strong><br>
                          • <strong>NO</strong> ninguna clase de short.<br>
                          • <strong>NO</strong> transparencias ni encajes reveladores.<br>
                          • <strong>NO</strong> escotes pronunciados ni blusas de tirantes finos.<br>
                          • <strong>NO</strong> ropa muy ceñida o ajustada (leggings sin cubrir, crop tops).<br>
                          • <strong>NO</strong> batas cortas o prendas tipo lencería.<br><br>
                          💡 <em>¿No tienes pijama?</em> ¡No te preocupes! Puedes asistir en <strong>jean y abrigo</strong>.<br><br>
                          ¡La idea es estar cómodos y abrigaditos con pudor! 🧸
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="font-size: 11px; color: #86efac; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 2px;">Iglesia</td>
                    </tr>
                    <tr>
                      <td style="font-size: 13px; color: #ffffff; padding-bottom: 12px;">${church}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 11px; color: #86efac; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 2px;">Lugar y Ubicación</td>
                    </tr>
                    <tr>
                      <td style="font-size: 13px; color: #ffffff; line-height: 1.5;">
                        Iglesia De Convertidos a Cristo (ICC)<br>
                        C/ Dr. Núñez Domínguez #30, Ensanche La Julia, Santo Domingo<br>
                        <div style="margin-top: 10px;">
                          <a href="${googleMapsUrl}" target="_blank" style="background-color: #1f4731; border: 1px solid #34d399; color: #a7f3d0; display: inline-block; padding: 8px 16px; font-weight: 700; border-radius: 50px; text-decoration: none; font-size: 12px;">
                            📍 Ver Ubicación Exacta en Google Maps
                          </a>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Cuentas Bancarias Oficiales de ICC (Omitiendo cuenta de ahorros del Popular) -->
              <tr>
                <td style="padding-top: 16px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #141816; border: 1px dashed #ef4444; border-radius: 12px; padding: 20px;">
                    <tr>
                      <td style="font-size: 14px; font-weight: 800; color: #fca5a5; padding-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">
                        🏦 Datos de Pago y Transferencia (RD$ 350 p/p)
                      </td>
                    </tr>
                    <tr>
                      <td style="font-size: 13px; color: #e5e7eb; line-height: 1.6;">
                        Puedes realizar tu depósito o transferencia de <strong>RD$ 350 por persona</strong> a cualquiera de las siguientes cuentas corrientes de la <strong>Iglesia de Convertidos a Cristo (ICC)</strong> <span style="font-size: 11.5px; color: #9ca3af;">(toca cada recuadro para seleccionar y copiar el dato)</span>:<br><br>

                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                          <tr>
                            <td style="background-color: #0b1610; border: 1px solid #264a36; border-radius: 8px; padding: 10px 12px; margin-bottom: 8px;">
                              <div style="font-size: 11px; color: #9ca3af;">Banreservas (Cuenta Corriente)</div>
                              <div style="font-size: 16px; font-weight: 800; color: #fde047; font-family: monospace; user-select: all; -webkit-user-select: all;">0102401330</div>
                            </td>
                          </tr>
                          <tr><td style="height: 8px;"></td></tr>
                          <tr>
                            <td style="background-color: #0b1610; border: 1px solid #264a36; border-radius: 8px; padding: 10px 12px;">
                              <div style="font-size: 11px; color: #9ca3af;">Banco Popular (Cuenta Corriente RD$)</div>
                              <div style="font-size: 16px; font-weight: 800; color: #fde047; font-family: monospace; user-select: all; -webkit-user-select: all;">805943297</div>
                            </td>
                          </tr>
                          <tr><td style="height: 8px;"></td></tr>
                          <tr>
                            <td style="background-color: #0b1610; border: 1px solid #264a36; border-radius: 8px; padding: 10px 12px;">
                              <div style="font-size: 11px; color: #9ca3af;">RNC ICC (Iglesia de Convertidos a Cristo)</div>
                              <div style="font-size: 15px; font-weight: 800; color: #fde047; font-family: monospace; user-select: all; -webkit-user-select: all;">424-00200-2</div>
                            </td>
                          </tr>
                          <tr><td style="height: 8px;"></td></tr>
                          <tr>
                            <td style="background-color: #0b1610; border: 1px solid #264a36; border-radius: 8px; padding: 10px 12px;">
                              <div style="font-size: 11px; color: #9ca3af;">Correo para enviar comprobante de pago</div>
                              <div style="font-size: 14px; font-weight: 800; color: #86efac; font-family: monospace; user-select: all; -webkit-user-select: all;">secretaria@convertidosacristo.org</div>
                            </td>
                          </tr>
                        </table>

                        <span style="font-size: 12px; color: #a7f3d0; display: block; margin-bottom: 14px;">💡 <em>Sugerencia: En la descripción o concepto de la transferencia coloca <strong>"Cena Jóvenes - ${fullName}"</strong>.</em></span>

                        <!-- Botones para Copiar Datos en 1 Clic y Enviar Correo con el Pago -->
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td align="center" style="padding-bottom: 10px;">
                              <a href="${copiarDatosUrl}" target="_blank" style="background-color: #eab308; color: #000000; display: block; padding: 12px 18px; font-weight: 800; border-radius: 10px; text-decoration: none; font-size: 13px; text-align: center;">
                                📋 Copiar Números de Cuenta y RNC (1 Clic en la Web)
                              </a>
                            </td>
                          </tr>
                          <tr>
                            <td align="center">
                              <a href="${mailtoPagoUrl}" style="background-color: #16a34a; color: #ffffff; display: block; padding: 12px 18px; font-weight: 800; border-radius: 10px; text-decoration: none; font-size: 13px; text-align: center;">
                                📧 Enviar Correo con el Comprobante de Pago
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              ${preRegButtonHtml}

              <tr>
                <td style="padding-top: 24px; font-size: 12px; color: #86efac; line-height: 1.5; border-top: 1px solid #1f4731; margin-top: 24px;">
                  Si tienes alguna duda o consulta sobre la Cena de Jóvenes, escríbenos a nuestras cuentas de Instagram <a href="https://www.instagram.com/onetwentyoneicc" target="_blank" style="color: #ffffff; text-decoration: underline;">@onetwentyoneicc</a> o <a href="https://www.instagram.com/jovenes_icc" target="_blank" style="color: #ffffff; text-decoration: underline;">@jovenes_icc</a>.
                </td>
              </tr>
            </table>
            <table width="100%" max-width="520" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; text-align: center; margin-top: 20px;">
              <tr>
                <td style="font-size: 10px; color: #555555; line-height: 1.4;">
                  Este correo fue enviado automáticamente por el Ministerio de Jóvenes de la Iglesia De Convertidos a Cristo (ICC).<br>
                  © 2026 Iglesia De Convertidos a Cristo. Todos los derechos reservados.
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
    name: "Cena de Jóvenes ICC"
  });
}

/**
 * Envía un correo de prueba al administrador con la plantilla para quienes reciben el correo por primera vez.
 */
function enviarPruebaCenaPreRegistrados() {
  var adminEmail = "kevito.valdez@gmail.com";
  try {
    enviarCorreoRegistroCena({
      email: adminEmail,
      firstName: "Kevin (Prueba 1er Envío)",
      lastName: "Valdez",
      phone: "809-555-0199",
      church: "Iglesia De Convertidos a Cristo",
      ageGroup: "18-25",
      isReenvio: false
    }, true, false);
    SpreadsheetApp.getUi().alert("Correo de prueba (Primer Envío: ¡Inscripciones Abiertas!) enviado a " + adminEmail);
  } catch (e) {
    SpreadsheetApp.getUi().alert("Error al enviar prueba: " + e.toString());
  }
}

/**
 * Envía un correo de prueba al administrador con la plantilla del Segundo Mensaje (Paso Final - Título Diferente)
 * para quienes ya habían recibido una notificación previa.
 */
function enviarPruebaCenaSegundoMensaje() {
  var adminEmail = "kevito.valdez@gmail.com";
  try {
    enviarCorreoRegistroCena({
      email: adminEmail,
      firstName: "Kevin (Prueba 2do Mensaje)",
      lastName: "Valdez",
      phone: "809-555-0199",
      church: "Iglesia De Convertidos a Cristo",
      ageGroup: "18-25",
      isReenvio: true
    }, true, true);
    SpreadsheetApp.getUi().alert("Correo de prueba (Segundo Envío: Paso Final) enviado a " + adminEmail);
  } catch (e) {
    SpreadsheetApp.getUi().alert("Error al enviar prueba: " + e.toString());
  }
}

/**
 * Envía un correo de prueba al administrador con la plantilla de confirmación para nuevos registros de la Cena.
 */
function enviarPruebaCenaNuevoRegistro() {
  var adminEmail = "kevito.valdez@gmail.com";
  try {
    enviarCorreoRegistroCena({
      email: adminEmail,
      firstName: "Kevin (Prueba Nuevo Registro)",
      lastName: "Valdez",
      phone: "809-555-0199",
      church: "Iglesia De Convertidos a Cristo",
      ageGroup: "18-25"
    }, false);
    SpreadsheetApp.getUi().alert("Correo de prueba (Nuevo Registro Cena de Jóvenes) enviado a " + adminEmail);
  } catch (e) {
    SpreadsheetApp.getUi().alert("Error al enviar prueba: " + e.toString());
  }
}

/**
 * Botón / Función de envío masivo para todas las personas que ya hicieron el Pre-Registro
 * en la hoja "Cena de Jóvenes", enviándoles el botón de confirmación en 1 clic.
 * 
 * • A quienes ya se les envió un primer mensaje: se les envía con el título actualizado ("🎄 Paso Final: Confirma tu Registro Oficial en 1 Clic").
 * • A quienes no han recibido mensaje aún: se les envía con el título de apertura oficial ("🎄 ¡Inscripciones Abiertas! Confirma tu Registro Oficial en 1 Clic").
 */
function enviarMasivoCenaPreRegistrados() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    'Confirmación de envío masivo - Cena de Jóvenes 2026',
    'Se enviará el correo con el botón de confirmación en 1 clic a los pre-registrados en la hoja "Cena de Jóvenes":\n\n' +
    '• A quienes ya se les envió un primer mensaje: recibirán el correo con el título actualizado ("🎄 Paso Final: Confirma tu Registro Oficial en 1 Clic").\n' +
    '• A los nuevos pre-registrados: recibirán el correo de apertura ("🎄 ¡Inscripciones Abiertas! Confirma tu Registro Oficial en 1 Clic").\n\n' +
    '¿Deseas continuar con el envío?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Cena de Jóvenes");
  if (!sheet) {
    ui.alert("Error", "No se encontró la hoja 'Cena de Jóvenes'.", ui.ButtonSet.OK);
    return;
  }

  var data = sheet.getDataRange().getValues();
  var countNuevos = 0;
  var countSegundoEnvio = 0;

  for (var i = 1; i < data.length; i++) {
    var firstName = data[i][3]; // Columna D: Nombre
    var lastName = data[i][4];  // Columna E: Apellido
    var email = data[i][5];     // Columna F: Correo
    var phone = data[i][6];     // Columna G: Teléfono
    var church = data[i][7];    // Columna H: Iglesia
    var ageGroup = data[i][8];  // Columna I: Rango de edad
    var estadoEnvio = data[i][10] ? String(data[i][10]).trim() : ""; // Columna K: Estado de Notificación

    // Comprobar si ya se le envió este enlace de 1 Clic
    var yaTieneEnlace1Clic = estadoEnvio.indexOf("1-Clic") !== -1;
    var yaRecibioPrimerMensaje = estadoEnvio !== "" && !yaTieneEnlace1Clic;

    // Procesar a quienes tengan correo válido y no hayan recibido aún el enlace de 1 Clic
    if (email && String(email).trim().indexOf("@") !== -1 && !yaTieneEnlace1Clic) {
      try {
        var esSegundo = yaRecibioPrimerMensaje;

        enviarCorreoRegistroCena({
          email: String(email).trim(),
          firstName: firstName,
          lastName: lastName,
          phone: phone,
          church: church,
          ageGroup: ageGroup,
          isReenvio: esSegundo
        }, true, esSegundo);

        if (esSegundo) {
          countSegundoEnvio++;
          sheet.getRange(i + 1, 11).setValue("Info 1-Clic Enviada (2do Mensaje - " + new Date().toLocaleDateString() + ")");
        } else {
          countNuevos++;
          sheet.getRange(i + 1, 11).setValue("Info 1-Clic Enviada (1er Mensaje - " + new Date().toLocaleDateString() + ")");
        }

        Utilities.sleep(150); // Pausa prudente para respetar cuota de Apps Script
      } catch (e) {
        console.error("Error enviando correo de Cena a " + email + ": " + e.toString());
      }
    }
  }

  SpreadsheetApp.flush();
  ui.alert(
    "Proceso completado",
    "Se completó el envío de correos:\n\n" +
    "• Segundo mensaje (Paso Final - Título Diferente): " + countSegundoEnvio + "\n" +
    "• Primer mensaje (Nuevos pre-registrados): " + countNuevos + "\n" +
    "• Total enviados: " + (countSegundoEnvio + countNuevos),
    ui.ButtonSet.OK
  );
}


/**
 * 6. CONSULTAR CUOTA DE CORREOS RESTANTES
 * Muestra una alerta en Google Sheets con los correos disponibles hoy según MailApp.
 */
function consultarCorreosRestantes() {
  var cuota = MailApp.getRemainingDailyQuota();
  var ui = SpreadsheetApp.getUi();
  
  var mensaje = "📊 Tienes " + cuota + " correos disponibles para enviar hoy.\n\n" +
                "ℹ️ Información sobre límites de Google:\n" +
                "• Cuentas personales (@gmail.com): 100 correos cada 24 horas.\n" +
                "• Cuentas Google Workspace / educativas: 1,500 correos cada 24 horas.\n" +
                "• La cuota se reinicia automáticamente cada 24 horas.";
                
  ui.alert("Cuota de Correos Disponibles Hoy", mensaje, ui.ButtonSet.OK);
}

// Alias para mantener compatibilidad si se llama con el nombre anterior
function mostrarCuotaRestante() {
  consultarCorreosRestantes();
}

// Función auxiliar de compatibilidad para pre-ordenes pasadas
function enviarCorreoPreordenComida(data) {
  console.log("enviarCorreoPreordenComida omitido (actividad pasada).");
}
