            class CartaNavegacion {
                constructor(cfg) {
                    this.configuracion = cfg;
                    
                    this.fechaHora = new Date();
                    this.paginaActual = 1;
                    this.paginasTotales = cfg.numeroRepeticionesPorDia;
                    
                    this.datos = [];
                    for (let i = this.paginaActual; i <= this.paginasTotales; i++) {
                        this.datos.push(new Rezos(cfg));
                    }
                }
                
                
                retrocederNavegacion() {
                    if (this.paginaActual > 1) {
                        this.paginaActual--;
                    }
                }
                
                avanzarNavegacion() {
                    if (this.paginaActual === this.paginasTotales) {
                        if (confirm("¿Desea crear una nueva página?")) {
                            this.paginasTotales++;
                            
                            this.datos.push(new Rezos(this.configuracion));
                            
                            this.paginaActual++;
                        }
                    } else {
                        this.paginaActual++;
                    }
                }
                
                
                rezosPaginaActual() {
                    return this.datos[this.paginaActual - 1];
                }
            }
