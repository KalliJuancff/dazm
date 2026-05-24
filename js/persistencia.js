            const CLAVE_ESTADO = "dazm-estado";
            const VERSION_ESTADO = 1;

            class Persistencia {
                static cargarCarta(cfg) {
                    const estado = Persistencia._leerEstado(cfg);
                    if (!estado) {
                        const carta = new CartaNavegacion(cfg);
                        Persistencia.guardarCarta(carta);
                        return carta;
                    }

                    return Persistencia._crearCartaDesdeEstado(cfg, estado);
                }

                static guardarCarta(carta) {
                    localStorage.setItem(CLAVE_ESTADO, JSON.stringify(Persistencia._serializarCarta(carta)));
                }

                static borrarEstado() {
                    localStorage.removeItem(CLAVE_ESTADO);
                }

                static _leerEstado(cfg) {
                    const raw = localStorage.getItem(CLAVE_ESTADO);
                    if (!raw || !raw.trim()) {
                        return null;
                    }

                    let estado;
                    try {
                        estado = JSON.parse(raw);
                    } catch {
                        localStorage.removeItem(CLAVE_ESTADO);
                        return null;
                    }

                    if (!Persistencia._esEstadoValido(estado, cfg)) {
                        localStorage.removeItem(CLAVE_ESTADO);
                        return null;
                    }

                    const fechaSello = new Date(estado.fechaHora);
                    if (!Persistencia._esMismoDiaCalendario(fechaSello, new Date())) {
                        localStorage.removeItem(CLAVE_ESTADO);
                        return null;
                    }

                    return estado;
                }

                static _esMismoDiaCalendario(a, b) {
                    return a.getFullYear() === b.getFullYear()
                        && a.getMonth() === b.getMonth()
                        && a.getDate() === b.getDate();
                }

                static _esEstadoValido(estado, cfg) {
                    if (!estado || estado.version !== VERSION_ESTADO) {
                        return false;
                    }
                    if (!estado.fechaHora || typeof estado.paginaActual !== "number" || typeof estado.paginasTotales !== "number") {
                        return false;
                    }
                    if (!Array.isArray(estado.paginas) || estado.paginas.length === 0) {
                        return false;
                    }
                    if (estado.paginaActual < 1 || estado.paginaActual > estado.paginasTotales) {
                        return false;
                    }
                    if (estado.paginas.length !== estado.paginasTotales) {
                        return false;
                    }

                    const oracionesEsperadas = cfg.oracionesDiarias.length;
                    const rezosEsperados = cfg.numeroRezosPorOracion;

                    for (const pagina of estado.paginas) {
                        if (!Array.isArray(pagina.oraciones) || pagina.oraciones.length !== oracionesEsperadas) {
                            return false;
                        }
                        for (const oracion of pagina.oraciones) {
                            if (!Array.isArray(oracion.rezos) || oracion.rezos.length !== rezosEsperados) {
                                return false;
                            }
                        }
                    }

                    return true;
                }

                static _serializarCarta(carta) {
                    return {
                        version: VERSION_ESTADO,
                        fechaHora: carta.fechaHora.toISOString(),
                        paginaActual: carta.paginaActual,
                        paginasTotales: carta.paginasTotales,
                        paginas: carta.datos.map(rezos => Persistencia._serializarRezos(rezos))
                    };
                }

                static _serializarRezos(rezos) {
                    return {
                        indiceOracionActual: rezos.indiceOracionActual,
                        oraciones: rezos.oraciones.map(oracion => ({
                            indiceRezoActual: oracion.indiceRezoActual,
                            rezos: oracion.rezos.map(rezo => ({
                                iniciado: rezo.iniciado,
                                completado: rezo.completado
                            }))
                        }))
                    };
                }

                static _crearCartaDesdeEstado(cfg, estado) {
                    const carta = new CartaNavegacion(cfg);
                    carta.fechaHora = new Date(estado.fechaHora);
                    carta.paginaActual = estado.paginaActual;
                    carta.paginasTotales = estado.paginasTotales;
                    carta.datos = estado.paginas.map(pagina => Rezos.desdeEstado(cfg, pagina));
                    return carta;
                }
            }
