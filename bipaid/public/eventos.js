// =====================================================
// EVENTOS EPT
// =====================================================

let eventos = [];

// =====================================================
// DESATIVAR RECOMENDAÇÃO
// =====================================================

function configurarRecomendacao() {

    const botao =
        document.querySelector(".recomendacao-eventos a");

    const recomendacao =
        document.querySelector(".recomendacao-eventos");


    if (!botao || !recomendacao) return;


    botao.addEventListener("click", function (evento) {

        evento.preventDefault();

        recomendacao.style.display = "none";

    });
}


// =====================================================
// PEGAR DATA DO EVENTO
// =====================================================

function obterDataEvento(texto) {

    const agora = new Date();

    const ano = agora.getFullYear();

    const meses = {
        "jan": 0,
        "fev": 1,
        "mar": 2,
        "abr": 3,
        "mai": 4,
        "jun": 5,
        "jul": 6,
        "ago": 7,
        "set": 8,
        "out": 9,
        "nov": 10,
        "dez": 11
    };


    const partes =
        texto.toLowerCase().split("·");


    if (partes.length < 2) {

        return "";

    }


    const dataTexto =
        partes[0].trim();


    const horario =
        partes[1].trim();


    const dataPartes =
        dataTexto.split(" ");


    const dia =
        Number(dataPartes[0]);


    const mesTexto =
        dataPartes[1];


    const mes =
        meses[mesTexto];


    if (
        !dia ||
        mes === undefined
    ) {

        return "";

    }


    return {
        data:
            `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`,

        horario:
            horario
    };
}


// =====================================================
// ADICIONAR EVENTO À AGENDA
// =====================================================

async function adicionarEvento(botao) {

    const card =
        botao.closest(".card-evento");


    if (!card) return;


    const descricao =
        card.querySelector(".descricao-evento");


    const informacoes =
        card.querySelectorAll(".informacao span:last-child");


    const dataTexto =
        informacoes[0]?.textContent.trim() || "";


    const local =
        informacoes[1]?.textContent.trim() || "";


    const publico =
        informacoes[2]?.textContent.trim() || "";


    const titulo =
        descricao
            ? descricao.textContent.trim()
            : "Evento EPT";


    const dadosData =
        obterDataEvento(dataTexto);


    if (!dadosData) {

        alert(
            "Não foi possível identificar a data do evento."
        );

        return;

    }


    try {

        const resposta =
            await fetch("/api/tarefas", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    titulo:
                        `Evento EPT: ${titulo}`,

                    descricao:
                        `Local: ${local}\nPúblico: ${publico}`,

                    data:
                        dadosData.data,

                    horario:
                        dadosData.horario,

                    categoria:
                        "eventos",

                    prioridade:
                        "normal"

                })

            });


        let dados = {};

        try {

            dados =
                await resposta.json();

        } catch (erro) {

            dados = {};

        }


        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                `Erro HTTP ${resposta.status}`
            );

        }


        alert(
            "Evento adicionado à sua agenda com sucesso!"
        );


        botao.textContent =
            "✓ Adicionado à agenda";


        botao.classList.add(
            "evento-adicionado"
        );


        botao.style.pointerEvents =
            "none";


    } catch (erro) {

        console.error(
            "Erro ao adicionar evento:",
            erro
        );


        alert(
            "Não foi possível adicionar o evento à agenda.\n\n" +
            erro.message
        );

    }
}


// =====================================================
// CONFIGURAR BOTÕES DOS EVENTOS
// =====================================================

function configurarEventos() {

    const botoes =
        document.querySelectorAll(".botao-agenda");


    botoes.forEach(function (botao) {

        botao.addEventListener(
            "click",
            function (evento) {

                evento.preventDefault();

                adicionarEvento(botao);

            }
        );

    });
}


// =====================================================
// LINKS TEMPORÁRIOS
// =====================================================

function configurarLinksTemporarios() {

    const links =
        document.querySelectorAll(
            '.link-menu[href="#"]'
        );


    links.forEach(function (link) {

        link.addEventListener(
            "click",
            function (evento) {

                evento.preventDefault();

            }
        );

    });


    const referencias =
        document.querySelectorAll(
            ".referencia-evento"
        );


    referencias.forEach(function (link) {

        link.addEventListener(
            "click",
            function (evento) {

                evento.preventDefault();

            }
        );

    });
}


// =====================================================
// INICIAR PÁGINA
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        mostrarUsuario();
        configurarRecomendacao();
        configurarEventos();
        configurarLinksTemporarios();

    }
);