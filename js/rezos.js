            class Rezos {
                constructor(cfg) {
                    this.oraciones = [];
                    for (let od of cfg.oracionesDiarias) {
                        const nombre = od[0];
                        const abreviatura = od[1];
                        
                        const oracion = new Oracion(nombre, abreviatura, cfg.numeroRezosPorOracion);
                        this.oraciones.push(oracion);
                    }
                    this.indiceOracionActual = 0;
                }
                
                static desdeEstado(cfg, estado) {
                    const rezos = new Rezos(cfg);
                    rezos.indiceOracionActual = estado.indiceOracionActual;
                    
                    for (let i = 0; i < rezos.oraciones.length; i++) {
                        const oracion = rezos.oraciones[i];
                        const estadoOracion = estado.oraciones[i];
                        oracion.indiceRezoActual = estadoOracion.indiceRezoActual;
                        
                        for (let j = 0; j < oracion.rezos.length; j++) {
                            const rezo = oracion.rezos[j];
                            const estadoRezo = estadoOracion.rezos[j];
                            rezo.iniciado = estadoRezo.iniciado;
                            rezo.completado = estadoRezo.completado;
                        }
                    }
                    
                    return rezos;
                }
                
                
                continuarRezo() {
                    if (this.estanRezosCompletados()) {
                        return;
                    }

                    this.situarCursorParaContinuar();

                    const rezo = this.rezoEnCursor();
                    rezo.continuar();

                    if (rezo.completado && !this.estanRezosCompletados()) {
                        this.irASiguientePendiente();
                        const siguiente = this.rezoEnCursor();
                        if (siguiente && !siguiente.iniciado) {
                            siguiente.darPorIniciado();
                        }
                    }
                }
                
                estanRezosCompletados() {
                    return this.oraciones.every(oracion => oracion.estaOracionCompletada());
                }
                
                oracionActual() {
                    return this.oraciones[this.indiceOracionActual];
                }
                
                obtenerRezo(x, y) {
                    return this.oraciones[Number(y)].rezos[Number(x)];
                }
                
                fijarCursorEn(x, y) {
                    x = Number(x);
                    y = Number(y);
                    const rezo = this.obtenerRezo(x, y);

                    if (rezo.iniciado && !rezo.completado) {
                        this.fijarCursor(x, y);
                        return;
                    }

                    if (rezo.completado) {
                        this.fijarCursor(x, y);
                        if (!this.estanRezosCompletados()) {
                            this.irASiguientePendiente();
                        }
                        return;
                    }

                    this.actualizarIndices();
                }
                
                actualizarIndices() {
                    const gris = this.ultimoGrisClaro();
                    if (gris) {
                        this.fijarCursor(gris.x, gris.y);
                        return;
                    }

                    this.irAPendienteMasProximoAlInicio();
                }

                situarCursorParaContinuar() {
                    if (this.cursorEsGrisClaro()) {
                        return;
                    }

                    const gris = this.ultimoGrisClaro();
                    if (gris) {
                        this.fijarCursor(gris.x, gris.y);
                        return;
                    }

                    if (!this.cursorEsPendiente()) {
                        this.irAPendienteMasProximoAlInicio();
                    }
                }

                listarRezos() {
                    const lista = [];
                    for (let y = 0; y < this.oraciones.length; y++) {
                        const oracion = this.oraciones[y];
                        for (let x = 0; x < oracion.rezos.length; x++) {
                            lista.push({ x, y, rezo: oracion.rezos[x] });
                        }
                    }
                    return lista;
                }

                fijarCursor(x, y) {
                    this.indiceOracionActual = y;
                    this.oraciones[y].indiceRezoActual = x;
                }

                esCursorValido() {
                    if (this.indiceOracionActual < 0 || this.indiceOracionActual >= this.oraciones.length) {
                        return false;
                    }

                    const oracion = this.oracionActual();
                    return oracion.indiceRezoActual >= 0 && oracion.indiceRezoActual < oracion.rezos.length;
                }

                rezoEnCursor() {
                    return this.esCursorValido() ? this.oracionActual().rezoActual() : null;
                }

                cursorEsGrisClaro() {
                    const rezo = this.rezoEnCursor();
                    return rezo !== null && rezo.iniciado && !rezo.completado;
                }

                cursorEsPendiente() {
                    const rezo = this.rezoEnCursor();
                    return rezo !== null && !rezo.completado;
                }

                ultimoGrisClaro() {
                    const grises = this.listarRezos().filter(item => item.rezo.iniciado && !item.rezo.completado);
                    return grises.length > 0 ? grises[grises.length - 1] : null;
                }

                irAPendienteMasProximoAlInicio() {
                    const pendiente = this.listarRezos().find(item => !item.rezo.completado);
                    if (pendiente) {
                        this.fijarCursor(pendiente.x, pendiente.y);
                    } else {
                        this.indiceOracionActual = this.oraciones.length;
                    }
                }

                irASiguientePendiente() {
                    const todos = this.listarRezos();
                    if (!this.esCursorValido()) {
                        this.irAPendienteMasProximoAlInicio();
                        return;
                    }

                    const indiceActual = todos.findIndex(item =>
                        item.x === this.oracionActual().indiceRezoActual &&
                        item.y === this.indiceOracionActual
                    );

                    for (let i = 1; i <= todos.length; i++) {
                        const item = todos[(indiceActual + i) % todos.length];
                        if (!item.rezo.completado) {
                            this.fijarCursor(item.x, item.y);
                            return;
                        }
                    }
                }
            }
            
            
            class Oracion {
                constructor(nombre, abreviatura, numero) {
                    this.nombre = nombre;
                    this.abreviatura = abreviatura;
                    
                    this.rezos = [];
                    for (let i = 0; i < numero; i++) {
                        const rezo = new Rezo();
                        this.rezos.push(rezo);
                    }
                    
                    this.resetear();
                }
                
                
                resetear() {
                    for (let rezo of this.rezos) {
                        rezo.resetear();
                    }
                    
                    this.indiceRezoActual = 0;
                }
                
                completar() {
                    for (const rezo of this.rezos) {
                        if (!rezo.completado) {
                            rezo.darPorCompletado();
                        }
                    }
                }
                
                estaOracionCompletada() {
                    return this.rezos.every(rezo => rezo.completado);
                }
                
                rezoActual() {
                    return this.rezos[this.indiceRezoActual];
                }
            }
            
            
            class Rezo {
                constructor() {
                    this.resetear();
                }
                
                resetear() {
                    this.iniciado = false;
                    this.completado = false;
                }
                
                continuar() {
                    if (this.completado) {
                        return;
                    }
                    
                    if (!this.iniciado) {
                        this.darPorIniciado();
                        return;
                    }
                    
                    this.darPorCompletado();
                }
                
                
                darPorIniciado() {
                    this.iniciado = true;
                }
                
                darPorCompletado() {
                    this.darPorIniciado();
                    
                    this.completado = true;
                }
            }
