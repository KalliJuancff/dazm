            const _claseEstrellas = "imagenEstrella";
            const _claseBotonesNavegacion = "botonNavegacion";
            const _claseAbreviaturas = "abreviatura";
            
            const _configuracion = new Configuracion();
            const _carta = Persistencia.cargarCarta(_configuracion);
            
            
            inicializarPantalla();
            asignarManejadoresEventos();
            
            
            function persistirEstado() {
                Persistencia.guardarCarta(_carta);
            }
            
            
            function inicializarPantalla() {
                mostrarInfoGeneral();
                mostrarInfoNavegacion();
                mostrarInfoRezos();
                mostrarBotonesNavegacion();
                actualizarInfoRezos();
            }
            
            function mostrarInfoGeneral() {
                const fh = _carta.fechaHora;
                const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
                // "getDay()" devuelve el día de la semana:
                // https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Date/getDay
                const mes = (fh.getMonth() + 1).toString().padStart(2, "0");
                const texto = `${diasSemana[fh.getDay()]}, ${fh.getDate()}/${mes}/${fh.getFullYear()} ` +
                    `${fh.getHours().toString().padStart(2, "0")}h ${fh.getMinutes().toString().padStart(2, "0")}m ${fh.getSeconds().toString().padStart(2, "0")}s`;
                
                const div = document.getElementById("infoGeneral");
                div.innerHTML = texto;
            }
            
            function mostrarInfoNavegacion() {
                const texto = `Pág. ${_carta.paginaActual} de ${_carta.paginasTotales}`;
                
                const div = document.getElementById("infoNavegacion");
                div.innerHTML = texto;
            }
            
            function mostrarInfoRezos() {
                let y = 0;
                
                for (let oracion of _carta.rezosPaginaActual().oraciones) {
                    const divPrincipal = document.getElementById("infoRezos");
                    
                    const divFila = document.createElement("div");
                    divPrincipal.appendChild(divFila);
                    
                    const texto = document.createElement("button");
                    texto.id = y;
                    texto.setAttribute("class", _claseAbreviaturas);
                    texto.innerHTML = `${oracion.abreviatura}'s:`;
                    divFila.appendChild(texto);
                    
                    let x = 0;
                    
                    for (let rezo of oracion.rezos) {
                        const img = document.createElement("img");
                        img.id = `${x};${y}`;
                        img.setAttribute("class", _claseEstrellas);
                        img.width = 112;
                        img.src = "assets/images/Estrella_gris_oscuro.png";
                        
                        divPrincipal.appendChild(img);
                        
                        x++;
                    }
                    
                    y++;
                }
            }
            
            function mostrarBotonesNavegacion() {
                const div = document.getElementById("botonesNavegacion");
                
                const botonAtras = document.createElement("button");
                botonAtras.id = "botonNavegacionAtras";
                botonAtras.setAttribute("class", _claseBotonesNavegacion);
                botonAtras.innerHTML = "Atrás";
                div.appendChild(botonAtras);
                
                const botonContinuarRezo = document.createElement("button");
                botonContinuarRezo.id = "botonContinuarRezo";
                botonContinuarRezo.setAttribute("class", _claseBotonesNavegacion);
                botonContinuarRezo.innerHTML = "Continuar";
                div.appendChild(botonContinuarRezo);
                
                const botonAdelante = document.createElement("button");
                botonAdelante.id = "botonNavegacionAdelante";
                botonAdelante.setAttribute("class", _claseBotonesNavegacion);
                botonAdelante.innerHTML = "Adelante";
                div.appendChild(botonAdelante);
            }
            
            
            function asignarManejadoresEventos() {
                asignarManejadorEventoClicBotonesAbreviaturasRezos();
                asignarManejadorEventoClicImagenEstrella();
                asignarManejadorEventoClicBotonRetrocederNavegacion();
                asignarManejadorEventoClicBotonContinuarRezo();
                asignarManejadorEventoClicBotonAvanzarNavegacion();
            }
            
            function asignarManejadorEventoClicBotonesAbreviaturasRezos() {
                const botones = document.getElementsByTagName("button");
                for (let boton of botones) {
                    boton.onclick = manejadorEventoClicBotonesAbreviaturasRezos;
                }
            }
            
            function manejadorEventoClicBotonesAbreviaturasRezos(e) {
                const boton = e.target;
                const indiceBoton = boton.id;
                
                const oracion = _carta.rezosPaginaActual().oraciones[indiceBoton];
                if (!oracion.estaOracionCompletada()) {
                    oracion.completar();
                } else {
                    oracion.resetear();
                }
                
                actualizarInfoRezos();
                _carta.rezosPaginaActual().actualizarIndices();
                persistirEstado();
            }
            
            function asignarManejadorEventoClicImagenEstrella() {
                const imagenes = document.getElementsByTagName("img");
                for (let imagen of imagenes) {
                    imagen.onclick = manejadorEventoClicImagenEstrella;
                }
            }
            
            function manejadorEventoClicImagenEstrella(e) {
                const imagen = e.target;
                const di = obtenerDatosImagen(imagen);
                
                const rezo = _carta.rezosPaginaActual().obtenerRezo(di.x, di.y);
                if (!rezo.completado) {
                    rezo.continuar();
                } else {
                    rezo.resetear();
                }
                
                actualizarInfoRezos();
                _carta.rezosPaginaActual().actualizarIndices();
                persistirEstado();
            }
            
            function asignarManejadorEventoClicBotonRetrocederNavegacion() {
                const botonNavegacionAtras = document.getElementById("botonNavegacionAtras");
                botonNavegacionAtras.onclick = manejadorEventoClicBotonNavegacionAtras;
            }
            
            function manejadorEventoClicBotonNavegacionAtras(e) {
                _carta.retrocederNavegacion();
                mostrarInfoNavegacion();
                actualizarInfoRezos();
                persistirEstado();
            }
            
            function asignarManejadorEventoClicBotonContinuarRezo() {
                const botonContinuarRezo = document.getElementById("botonContinuarRezo");
                botonContinuarRezo.onclick = manejadorEventoClicBotonContinuarRezo;
            }
            
            function manejadorEventoClicBotonContinuarRezo(e) {
                _carta.rezosPaginaActual().continuarRezo();
                actualizarInfoRezos();
                persistirEstado();
            }
            
            function actualizarInfoRezos() {
                const imagenes = document.getElementsByTagName("img");
                for (let imagen of imagenes) {
                    const di = obtenerDatosImagen(imagen);
                    const rezo = _carta.rezosPaginaActual().obtenerRezo(di.x, di.y);
                    
                    if (rezo.completado) {
                        imagen.src = "assets/images/Estrella_amarillo_dos_colores.png";
                    } else if (rezo.iniciado) {
                        imagen.src = "assets/images/Estrella_gris_claro.png";
                    } else {
                        imagen.src = "assets/images/Estrella_gris_oscuro.png";
                    }
                }
            }
            
            function obtenerDatosImagen(imagen) {
                const idImagen = imagen.id;
                const tokens = idImagen.split(";");
                const x = tokens[0];
                const y = tokens[1];
                
                return {x, y};
            }
            
            function asignarManejadorEventoClicBotonAvanzarNavegacion() {
                const botonNavegacionAdelante = document.getElementById("botonNavegacionAdelante");
                botonNavegacionAdelante.onclick = manejadorEventoClicBotonNavegacionAdelante;
            }
            
            function manejadorEventoClicBotonNavegacionAdelante(e) {
                _carta.avanzarNavegacion();
                mostrarInfoNavegacion();
                actualizarInfoRezos();
                persistirEstado();
            }
