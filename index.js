// Importamos las dependencias necesarias
const express = require('express');

// Inicializamos la app
const app = express();
const translate = require('google-translate-api');
const request = require('request');

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Método Get
app.get('/', (req, res) => {
    res.send("Funcionando");
});

// Método Post
app.post('/', (req, res) => {

    let jsonResponse = {};

    // Obtenemos la ciudad del mensaje
    let city = req.body.queryResult.parameters["geo-city"].toString();

    // Eliminamos acentos
    const removeAccents = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
    city = removeAccents(city);

    // URL del API para consultar el clima
    let url = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&id=524901&appid=63d91a59b80746dbf5f01faf782ee144`;

    // Valor en kelvin para hacer la conversion a grados centigrados
    let kelvin = 273.15;

    // Peticion
    request(url, function (error, response, body) {
        //console.log(body);
        let _body = JSON.parse(body);

        if (_body.cod === '200') {

            // Respuesta para dialogflow
            let _response = '';

            // Convertimos a JSON, la respuesta del servicio
            let meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            let mesTxt = meses[parseInt(_body.list[0].dt_txt.split(" ")[0].split("-")[1]) - 1];
            let fecha = `${_body.list[0].dt_txt.split(" ")[0].split("-")[2]} de ${mesTxt} de ${_body.list[0].dt_txt.split(" ")[0].split("-")[0]}`;
            let temperatura = _body.list[0].main.temp - kelvin;


            // Default
            _response = `La temperatura prevista para el día ${fecha} (${_body.list[0].dt_txt.split(" ")[1]}) en ${_body.city.name} es de ${temperatura.toFixed(1)} grados `;

            // Enviamos la respuesta
            jsonResponse = {
                "fulfillmentText": "This is a text response",
                "fulfillmentMessages": [
                    {
                        "text": {
                            "text": [
                                _response
                            ]
                        }
                    }
                ]
            };
            res.status(_body.cod).send(jsonResponse);

        } else {
            // ERROR!!!
            _response = 'No se pudo procesar la solicitud por el momento';
            jsonResponse = {
                "fulfillmentText": "This is a text response",
                "fulfillmentMessages": [
                    {
                        "text": {
                            "text": [
                                _response
                            ]
                        }
                    }
                ]
            };
            res.status(200).send(jsonResponse);
        }

    });


});

// Escuchando servidor de node
const PORT = 3000 || process.env.PORT;
app.listen(PORT);
