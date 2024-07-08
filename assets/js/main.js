document.addEventListener('DOMContentLoaded', () => {
    const inputPesos = document.getElementById('pesos');
    const selectMoneda = document.getElementById('moneda');
    const resultado = document.getElementById('resultado');
    const botonConvertir = document.getElementById('convertir');
    const ctx = document.getElementById('historial').getContext('2d');
    let chart = null;

    async function obtenerMonedas() {
        try {
            const respuesta = await fetch('https://mindicador.cl/api');
            const datos = await respuesta.json();
            const monedas = Object.keys(datos).filter(key => typeof datos[key] === 'object' && datos[key].codigo);
            monedas.forEach(moneda => {
                const option = document.createElement('option');
                option.value = moneda;
                option.text = datos[moneda].nombre;
                selectMoneda.appendChild(option);
            });
        } catch (error) {
            resultado.textContent = `Error: ${error.message}`;
        }
    }

    botonConvertir.addEventListener('click', async () => {
        const pesos = parseInt(inputPesos.value, 10);
        const moneda = selectMoneda.value;
        if (pesos && moneda) {
            try {
                const respuesta = await fetch(`https://mindicador.cl/api/${moneda}`);
                const datos = await respuesta.json();
                const valor = datos.serie[0].valor;
                const conversion = (pesos / valor).toFixed(2);
                // Formato con separadores de miles y decimales
                resultado.textContent = `Resultado: $${parseFloat(conversion).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                
                const historial = datos.serie.slice(0, 10).reverse();
                const labels = historial.map(entry => entry.fecha.split("T")[0]);
                const valores = historial.map(entry => entry.valor);

                if (chart) {
                    chart.destroy();
                }
                chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: `Valor de ${moneda} en los últimos 10 días`,
                            data: valores,
                            borderColor: '#1abc9c',
                            backgroundColor: 'rgba(26, 188, 156, 0.2)',
                        }]
                    },
                    options: {
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Fecha'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Valor'
                                }
                            }
                        }
                    }
                });
            } catch (error) {
                resultado.textContent = `Error: ${error.message}`;
            }
        } else {
            resultado.textContent = 'Por favor, ingrese un monto y seleccione una moneda.';
        }
    });

    obtenerMonedas();
});

