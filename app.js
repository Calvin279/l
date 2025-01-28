class ControlHoras {
    constructor() {
        this.registros = JSON.parse(localStorage.getItem('registros')) || [];
        this.inicializarEventos();
        this.renderizarRegistros();
    }

    inicializarEventos() {
        document.getElementById('registroForm').addEventListener('submit', this.registrarHoras.bind(this));
        document.getElementById('btnBuscar').addEventListener('click', this.buscarPorNombre.bind(this));
    }

    registrarHoras(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombre').value;
        const rango = document.getElementById('rango').value;
        const fecha = document.getElementById('fecha').value;
        const horaEntrada = document.getElementById('horaEntrada').value;
        const horaSalida = document.getElementById('horaSalida').value;

        const tiempoTrabajado = this.calcularTiempoTrabajado(horaEntrada, horaSalida);
        const cumplioMinimo = tiempoTrabajado >= 180; // 3 horas = 180 minutos

        const registro = {
            nombre,
            rango,
            fecha,
            horaEntrada,
            horaSalida,
            tiempoTrabajado: this.formatearTiempo(tiempoTrabajado),
            cumplioMinimo
        };

        this.registros.push(registro);
        this.guardarRegistros();
        this.renderizarRegistros();
        this.mostrarNotificacion(cumplioMinimo);
        this.limpiarFormulario();
    }

    calcularTiempoTrabajado(entrada, salida) {
        const [horasEntrada, minutosEntrada] = entrada.split(':').map(Number);
        const [horasSalida, minutosSalida] = salida.split(':').map(Number);

        const minutosEntradaTotal = horasEntrada * 60 + minutosEntrada;
        const minutosSalidaTotal = horasSalida * 60 + minutosSalida;

        return minutosSalidaTotal - minutosEntradaTotal;
    }

    formatearTiempo(minutos) {
        const horas = Math.floor(minutos / 60);
        const minutosRestantes = minutos % 60;
        return `${horas}h ${minutosRestantes}m`;
    }

    renderizarRegistros() {
        const tbody = document.getElementById('registrosBody');
        tbody.innerHTML = '';

        const semanaTotalHoras = this.calcularHorasemanales();

        this.registros.forEach((registro, index) => {
            const tr = document.createElement('tr');
            tr.classList.add(this.getClaseEstado(registro.cumplioMinimo, semanaTotalHoras));

            tr.innerHTML = `
                <td>${registro.nombre}</td>
                <td>${registro.rango}</td>
                <td>${registro.fecha}</td>
                <td>${registro.horaEntrada}</td>
                <td>${registro.horaSalida}</td>
                <td>${registro.tiempoTrabajado}</td>
                <td>
                    ${registro.cumplioMinimo 
                        ? '<span class="estado-cumplido">✓</span>' 
                        : '<span class="estado-incumplido">✗</span>'}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    calcularHorasemanales() {
        // Calcular horas de la semana actual
        return this.registros
            .filter(r => this.esDeLaSemanaActual(r.fecha))
            .reduce((total, r) => {
                const [horas, minutos] = r.tiempoTrabajado.split(/h |m/).map(Number);
                return total + horas + (minutos / 60);
            }, 0);
    }

    esDeLaSemanaActual(fechaStr) {
        const fecha = new Date(fechaStr);
        const inicioSemana = new Date();
        inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
        inicioSemana.setHours(0, 0, 0, 0);

        return fecha >= inicioSemana;
    }

    getClaseEstado(cumplioMinimo, semanaTotalHoras) {
        if (semanaTotalHoras < 28) return 'rojo';
        return cumplioMinimo ? 'verde' : 'rojo';
    }

    mostrarNotificacion(cumplioMinimo) {
        if (!cumplioMinimo) {
            alert('¡Advertencia! No se cumplió el mínimo de 3 horas.');
        }
    }

    buscarPorNombre() {
        const nombreBusqueda = document.getElementById('buscarNombre').value.toLowerCase();
        const registrosFiltrados = this.registros.filter(r => 
            r.nombre.toLowerCase().includes(nombreBusqueda)
        );

        const tbody = document.getElementById('registrosBody');
        tbody.innerHTML = '';

        const semanaTotalHoras = this.calcularHorasemanales();

        registrosFiltrados.forEach(registro => {
            const tr = document.createElement('tr');
            tr.classList.add(this.getClaseEstado(registro.cumplioMinimo, semanaTotalHoras));

            tr.innerHTML = `
                <td>${registro.nombre}</td>
                <td>${registro.rango}</td>
                <td>${registro.fecha}</td>
                <td>${registro.horaEntrada}</td>
                <td>${registro.horaSalida}</td>
                <td>${registro.tiempoTrabajado}</td>
                <td>
                    ${registro.cumplioMinimo 
                        ? '<span class="estado-cumplido">✓</span>' 
                        : '<span class="estado-incumplido">✗</span>'}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    guardarRegistros() {
        localStorage.setItem('registros', JSON.stringify(this.registros));
    }

    limpiarFormulario() {
        document.getElementById('registroForm').reset();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ControlHoras();
});