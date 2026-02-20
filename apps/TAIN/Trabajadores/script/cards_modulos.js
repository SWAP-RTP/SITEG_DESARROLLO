export function cards_modulos() {
    // Selecciona todos los cards de módulos
    document.querySelectorAll('.card-number[id^="modulo"], .card-number#oficinasc').forEach(card => {
        card.addEventListener('click', async () => {
            // Obtén el id del módulo 
            const moduloId = card.id.replace('modulo', '').replace('oficinasc', '0');
            let titulo = '';
            // Personaliza el título según el módulo
            switch (moduloId) {
                case '1': titulo = 'MÓDULO 1'; break;
                case '2': titulo = 'MÓDULO 2'; break;
                case '3': titulo = 'MÓDULO 3'; break;
                case '4': titulo = 'MÓDULO 4'; break;
                case '5': titulo = 'MÓDULO 5'; break;
                case '6': titulo = 'MÓDULO 6'; break;
                case '7': titulo = 'MÓDULO 7'; break;
                case '0': titulo = 'OFICINAS CENTRALES'; break;
                default: titulo = 'MÓDULO';
            }

            // Fetch y pintar datos del módulo seleccionado
            try {
                const response = await fetch('../Trabajadores/query_sql/total_trabajadores.php');
                if (!response.ok) throw new Error('Error de respuesta');
                const data = await response.json();

                let valores = data.detalle && data.detalle[moduloId] ? data.detalle[moduloId] : {};

                // Cambia el título y el contenido del modal
                document.getElementById('tituloModalModulo').innerText = titulo;
                document.getElementById('contenedorDetallesModulo').innerHTML = `
                    <div class="container-fluid">
                        <div class="row mb-2">
                            <div class="col-6"><h3>Total trabajadores Activos: ${valores.totaltrabact ?? 0}</h3></div>
                            <div class="col-6"><h3>Total trabajadores Inactivos: ${valores.totaltrabinact ?? 0}</h3></div>
                        </div>
                        <hr>
                        <div class="row mb-1">
                            <div class="col-6"><h5>Operadores activos: ${valores.totaloperadoresact ?? 0}</h5></div>
                            <div class="col-6"><h5>Operadores inactivos: ${valores.totaloperadoresinact ?? 0}</h5></div>
                        </div>
                        <div class="row mb-1">
                            <div class="col-6"><h5>Mantenimiento activo: ${valores.totalmantenimientoact ?? 0}</h5></div>
                            <div class="col-6"><h5>Mantenimiento inactivo: ${valores.totalmantenimientoinact ?? 0}</h5></div>
                        </div>
                        <div class="row mb-1">
                            <div class="col-6"><h5>Funcionarios oficinas activos: ${valores.totalfuncionariosoficinasact ?? 0}</h5></div>
                            <div class="col-6"><h5>Funcionarios oficinas inactivos: ${valores.totalfuncionariosoficinasinact ?? 0}</h5></div>
                        </div>
                        <div class="row mb-1">
                            <div class="col-6"><h5>Funcionarios módulos activos: ${valores.totalfuncionariosmodulosact ?? 0}</h5></div>
                            <div class="col-6"><h5>Funcionarios módulos inactivos: ${valores.totalfuncionariosmodulosinact ?? 0}</h5></div>
                        </div>
                        <div class="row mb-1">
                            <div class="col-6"><h5>Confianza oficinas activo: ${valores.totalconfianzaoficinaact ?? 0}</h5></div>
                            <div class="col-6"><h5>Confianza oficinas inactivo: ${valores.totalconfianzaoficinainact ?? 0}</h5></div>
                        </div>
                        <div class="row mb-1">
                            <div class="col-6"><h5>Confianza módulos activo: ${valores.totalconfianzamodulosact ?? 0}</h5></div>
                            <div class="col-6"><h5>Confianza módulos inactivo: ${valores.totalconfianzamodulosinact ?? 0}</h5></div>
                        </div>
                    </div>
                `;
            } catch (error) {
                document.getElementById('tituloModalModulo').innerText = titulo;
                document.getElementById('contenedorDetallesModulo').innerHTML = `<div class="col-12"><h3>Error al cargar datos</h3></div>`;
            }

            // Abre el modal usando Bootstrap 5
            const modal = new bootstrap.Modal(document.getElementById('modalxModulos'));
            modal.show();
        });
    });
}