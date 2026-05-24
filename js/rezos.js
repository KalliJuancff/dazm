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
                    let ultimoRezo = null;
                    
                    if (!this.oracionActual().estaOracionCompletada()) {
                        ultimoRezo = this.oracionActual().rezoActual();
                        
                        this.oracionActual().continuarRezo();
                        
                        if (this.oracionActual().estaOracionCompletada() && ((this.indiceOracionActual+1) < this.oraciones.length)) {
                            this.indiceOracionActual++;
                        }
                    } else {
                        if (!this.estanRezosCompletados() && ((this.indiceOracionActual+1) < this.oraciones.length)) {
                            this.indiceOracionActual++;
                        }
                    }
                    
                    if (ultimoRezo !== null && ultimoRezo.completado) {
                        this.continuarRezo();
                    }
                }
                
                estanRezosCompletados() {
                    return this.indiceOracionActual === this.oraciones.length;
                }
                
                oracionActual() {
                    return this.oraciones[this.indiceOracionActual];
                }
                
                obtenerRezo(x, y) {
                    return this.oraciones[y].rezos[x];
                }
                
                actualizarIndices() {
                    let salir = false;
                    this.indiceOracionActual = 0;
                    
                    this.oracionActual().actualizarIndice();
                    while (!salir) {
                        if (this.oracionActual().estaOracionCompletada()) {
                            this.indiceOracionActual++;
                            this.oracionActual().actualizarIndice();
                        } else {
                            salir = true;
                        }
                        
                        if (this.indiceOracionActual === this.oraciones.length) {
                            salir = true;
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
                
                continuarRezo() {
                    if (!this.rezoActual().completado) {
                        this.rezoActual().continuar();
                    }
                    
                    if (!this.estaOracionCompletada()) {
                        if (this.rezoActual().completado) {
                            this.indiceRezoActual++;
                        }
                    }
                }
                
                completar() {
                    while (!this.estaOracionCompletada()) {
                        this.continuarRezo();
                    }
                }
                
                estaOracionCompletada() {
                    return this.indiceRezoActual === this.rezos.length;
                }
                
                rezoActual() {
                    return this.rezos[this.indiceRezoActual];
                }
                
                actualizarIndice() {
                    let salir = false;
                    this.indiceRezoActual = 0;
                    
                    while (!salir) {
                        if (this.rezoActual().completado) {
                            this.indiceRezoActual++;
                        } else {
                            salir = true;
                        }
                        
                        if (this.indiceRezoActual === this.rezos.length) {
                            salir = true;
                        }
                    }
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
