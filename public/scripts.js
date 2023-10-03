window.onload = async function () {

  // Botones
  var botonEncriptar = document.getElementById("enc");
  var botonDesencriptar = document.getElementById("des");
  var botonLimpiar = document.getElementById("clear");
  //
  var selectorEnv = document.getElementById("env");
  var selector = document.getElementById("type-encrypter");
  var inputIV = document.getElementById("iv");
  var resultados = document.getElementById("resultados");
  var inputKey = document.getElementById("secret-key");
  var encrypterEl = document.getElementById("encrypter");
  resultados.style.display = "none";
  inputIV.disabled = true;
  var typeCipher = {
    ecb: "ecb",
    cbc: "cbc"
  }

  async function loadUrls() {
    const request = await fetch("http://localhost:8080/urls");
    const results = await request.json();
    return results;
  }

  var typeEnv = await loadUrls();
  botonEncriptar.addEventListener("click", function (e) {
    const iv = inputIV.value;
    const typeEncrypter = selector.value;
    const secretKey = inputKey.value;
    const encrypter = encrypterEl.value.trim();
    //
    const response = validarNullOrEmpty(encrypter, iv, typeEncrypter, secretKey);

    if (response.status) {
      encrypterAES(encrypter, iv, typeEncrypter, secretKey);
    } else {
      alert(response.mensaje);
    }
  });
  botonDesencriptar.addEventListener("click", function (e) {
    const encrypter = document.getElementById("encrypter").value;
    const iv = inputIV.value;
    const typeEncrypter = selector.value;
    const secretKey = document.getElementById("secret-key").value;
    //
    const response = validarNullOrEmpty(encrypter, iv, typeEncrypter, secretKey);

    if (response.status) {
      desencrypterAES(encrypter, iv, typeEncrypter, secretKey);
    } else {
      alert(response.mensaje);
    }
  });
  botonLimpiar.addEventListener("click", function (e) {
    resultados.style.display = "none";
  });

  selector.addEventListener('change', function () {
    if (selector.value === typeCipher.cbc) {
      inputIV.disabled = false;
    } else {
      inputIV.disabled = true;
    }
  });

  function validarNullOrEmpty(encrypter, iv, typeEncrypter, secretKey) {
    response = { status: true, mensaje: null };
    if (encrypter.trim() === "") {
      response.mensaje = "No se encuentró información en el texto a cifrar."
    } else if (iv.trim() === "" && typeEncrypter.trim() === "cbc") {
      response.mensaje = "No se encuentró información en el Vector de Inicialización."
    } else if (secretKey.trim() === "") {
      response.mensaje = "No se encuentró información en la clave secreta."
    }
    if (response.mensaje !== null) response.status = false;
    return response;
  }
  function encrypterAES(encrypter, iv, typeEncrypter, secretKey) {
    const plaintexmt = encrypter;
    let encodeKey = secretKey;
    let encodeIV = iv;

    encodeKey = CryptoJS.enc.Utf8.parse(encodeKey);
    encodeIV = CryptoJS.enc.Utf8.parse(encodeIV);
    let encryptedaes;
    try {
      if (typeEncrypter === 'ecb') {
        encryptedaes = CryptoJS.AES.encrypt(plaintexmt, encodeKey, {
          mode: CryptoJS.mode.ECB
        }).toString();
      } else {
        encryptedaes = CryptoJS.AES.encrypt(plaintexmt, encodeKey, {
          iv: encodeIV,
          mode: CryptoJS.mode.CBC
        }).toString();
      }
    } catch (e) {
      alert("¡Error! ¿Está seguro de usar la información correcta?");
      throw Error("No se encontró información para este proceso.")
    }
    generarRespuesta(encryptedaes);
  }
  function desencrypterAES(encrypter, iv, typeEncrypter, secretKey) {
    const encodeKey = CryptoJS.enc.Utf8.parse(secretKey); // 'MICLAROA20230914'
    const encodeIV = CryptoJS.enc.Utf8.parse(iv); // '00r941l4c2I0d2V3'
    const ciphertext = CryptoJS.enc.Base64.parse(decodeURIComponent(escape(encrypter))); // 'SlvfXBAtede2ye5WHUqTmKf82WtNE5acMCRKGCjAyPVaLKf2vl1hNjF6bDK9EDBFgDyvFEjRryTe4lmzlBu7iHnc5ejhgs9Nm0X9QY18UkkbLCf4aRaIDlRNPZ9r2kx0LswsnoZGGPYDyJVxsDxQPudw6kjETBbk26nfO06O2W1yjOSV9MY6cIqZhBG6ozW81qPuVLx50oDpLx9uzgwJ2Mlk1z+0vkd+yvvmnMsg5v4bdTq1imwb+yYqu6f6/Mym1Fl5NIuyuGVLDRVuYq1kKVxov5Hu/3BehK/bixvj7wVDaKlYm17LM0Pl7/M7+NtWStaw8YjmYdlgmilmeIp7J1fPMGPXIaBy3YiJOZfQYsQFQIewbRz6BS8rQfi3GMqPH6JrHXuS61pomTb85/GVtyJgH0Ue6XOD69CjY02aYVA='       
    const encryptedCP = CryptoJS.lib.CipherParams.create({
      ciphertext: ciphertext,
      formatter: CryptoJS.format.OpenSSL                                     // Optional, but required for encryptedCP.toString() 
    });
    let decryptedWA, decryptedUtf8;
    try {
      if (typeEncrypter === 'ecb') {
        decryptedWA = CryptoJS.AES.decrypt(encryptedCP, encodeKey, { mode: CryptoJS.mode.ECB });
      } else {
        decryptedWA = CryptoJS.AES.decrypt(encryptedCP, encodeKey, {
          iv: encodeIV,
          mode: CryptoJS.mode.CBC
        });
      }                            // Short for: encryptedCP.ciphertext.toString(CryptoJS.enc.Base64);
      decryptedUtf8 = decryptedWA.toString(CryptoJS.enc.Utf8)
    } catch (e) {
      alert("¡Error! ¿Está seguro de usar la información correcta?");
      throw Error("No se encontró información para este proceso.")
    }              // Avoid the Base64 detour.
    //
    generarRespuesta(decryptedUtf8, false);
  }
  function generarRespuesta(encryptedBase64, mode = true) {
    resultados.style.display = "flex";
    let respuestaDos;
    console.log("OK");
    if (typeCipher.cbc === selector.value) {
      respuestaDos = resultados.children[1].textContent = encryptedBase64;
      return;
    }
    if (mode) {
      respuestaDos = resultados.children[1].textContent = `${typeEnv[selectorEnv.value]}${encryptedBase64}`;
    } else {
      respuestaDos = resultados.children[1].textContent = `${encryptedBase64}`;
    }
    copyTextToClipboard(respuestaDos);
  }
  function getFormattedDate() {
    const date = new Date();

    // Obtén los componentes de la fecha
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // El mes está en base 0
    const day = date.getDate().toString().padStart(2, '0');

    // Formatea la fecha en el formato deseado (AñoMesDía)
    const formattedDate = `MICLAROA${year}${month}${day}`;

    return formattedDate;
  }

  function copyTextToClipboard(text) {
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('Texto copiado al portapapeles');
      })
      .catch((err) => {
        console.error('No se pudo copiar el texto: ', err);
      });
  }

  function getFormattedDateCBC() {
    const date = new Date();

    // Obtén los componentes de la fecha
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // El mes está en base 0
    const day = date.getDate().toString().padStart(2, '0');

    // Formatea la fecha en el formato deseado (MMDDYYYY)
    const formattedDate = month + day + year;

    return formattedDate;
  }

  const generatedDate = getFormattedDateCBC();
  const generatedString = '0r4lcIdV';

  // Combina la fecha y el string en el formato deseado
  const resultado = generatedString[0] + generatedDate[0] +
    generatedString[1] + generatedDate[1] + generatedString[2] +
    generatedDate[2] + generatedString[3] + generatedDate[3] +
    generatedString[4] + generatedDate[4] + generatedString[5] +
    generatedDate[5] + generatedString[6] + generatedDate[6] +
    generatedString[7] + generatedDate[7];

  inputIV.value = resultado;
  inputKey.value = getFormattedDate();

  var tabla = document.querySelector("#tabla-datos");
  tabla.style.display = "none";
  var enviar = document.getElementById("enviar");
  enviar.addEventListener("click", fetchData);
  async function fetchData() {
    var documento = document.getElementById("documento").value.trim();
    var company = document.getElementById("company").value.trim();
    var application = document.getElementById("application").value.trim();
    if (company === '' || application === '' || documento.length <= 3) {
      alert("Ingrese los datos empresa y aplicación para continuar.")
      return;
    }
    const request = await fetch("http://localhost:8080/todos", {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        company,
        application
      })
    });
    const datosSinParse = await request.json();
    const datos = JSON.parse(datosSinParse);
    tabla.style.display = "table";
    const tbody = tabla.querySelector("tbody");
    for (var i = 0; i < datos.length; i++) {
      var fila = document.createElement("tr");

      for (var j = 0; j < datos[i].length; j++) {
        var celda = document.createElement("td");
        celda.textContent = datos[i][j];
        if (j === 6) {
          celda.style.display = "none";
        }
        fila.appendChild(celda);
      };
      var boton = document.createElement("button");
      boton.textContent = "Seleccionar";
      boton.addEventListener("click", function () {
        // Obtén la fila padre del botón
        var filaSeleccionada = this.parentNode.parentNode;

        // Accede a los elementos <td> dentro de la fila y muestra los datos en la consola
        var celdas = filaSeleccionada.querySelectorAll("td");
        const helper = {
          canal: null,
          antiguedad: null,
          segmento: null,
          metodo: null,
          empresa: null,
          aplicacion: null,
          accessKey: null
        };
        Object.keys(helper).forEach((celda, index) => {
          helper[celda] = celdas[index].textContent;
        });
        const seg = ["HOG", "PRE", "POS", "N/A"];
        const premisa = helper.antiguedad;
        const fechaGenerada = generarFechaSegunPremisa(premisa);
        const string = `documentClient=${documento}|company=${helper.empresa}|application=${helper.aplicacion}|accessKey=${helper.accessKey}|user=ECM3628F|chanelTypeCode=${helper.canal}|urlReturn=https://www.claro.com.co/personas/|methodSendOK=get|urlOK=https://portalpagos.claro.com.co/index.php|idSucursal=CAC11.00001|accountType=${seg[helper.segmento]}|antiquityClient="${fechaGenerada}"`;
        encrypterEl.value = string;
        cerrarModal();
      });

      var celdaBoton = document.createElement("td");
      celdaBoton.appendChild(boton);
      fila.appendChild(celdaBoton);

      tbody.appendChild(fila);
    }
  }
  const modal = document.getElementById("myModal");
  const cerrarModalBtn = document.getElementById("cerrarModal");

  // Función para abrir el modal
  function abrirModal() {
    modal.style.display = "flex";
  }

  // Función para cerrar el modal
  function cerrarModal() {
    modal.style.display = "none";
  }

  function generarFechaSegunPremisa(premisa) {
    var fechaActual = new Date(); // Fecha actual

    if (premisa === "N/A") {
      return premisa;
    }
    // Verificar la premisa y ajustar la fecha según corresponda
    if (premisa === ">6") {
      fechaActual.setMonth(fechaActual.getMonth() - 7); // Resta 6 meses
    } else if (premisa === "<=6") {
      fechaActual.setMonth(fechaActual.getMonth() - 6); // Resta 6 meses
    } else {
      const caracter1 = "<=";
      const caracter2 = ">=";
      const caracter3 = "<";
      const caracter4 = ">";
      if (premisa.indexOf(caracter1)) {
        fechaActual.setMonth(fechaActual.getMonth() - parseInt(premisa.substr(2)), 10);
      } else if (premisa.indexOf(caracter2)) {
        fechaActual.setMonth(fechaActual.getMonth() - parseInt(premisa.substr(2)), 10);
      } else if (premisa.indexOf(caracter3)) {
        fechaActual.setMonth(fechaActual.getMonth() - parseInt(premisa.substr(1)), 10);
      } else if (premisa.indexOf(caracter4)) {
        fechaActual.setMonth(fechaActual.getMonth() - parseInt(premisa.substr(1)), 10);
      }
    }

    // Formatear la fecha en formato dd/mm/YYYY
    var dd = fechaActual.getDate();
    var mm = fechaActual.getMonth() + 1; // Los meses en JavaScript son 0-based
    var yyyy = fechaActual.getFullYear();

    if (dd < 10) {
      dd = '0' + dd;
    }

    if (mm < 10) {
      mm = '0' + mm;
    }

    var fechaFormateada = dd + '/' + mm + '/' + yyyy;

    return fechaFormateada;
  }

  // Mostrar el modal al cargar la página
  cerrarModalBtn.addEventListener("click", cerrarModal);
};