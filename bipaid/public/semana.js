// =====================================================
// MINHA SEMANA
// =====================================================

let tarefas = [];
let lancamentos = [];


// =====================================================
// CARREGAR DADOS
// =====================================================

async function carregarDados() {

    try {

        const resposta =
            await fetch("/api/tarefas");

        if (resposta.ok) {

            const dados =
                await resposta.json();

            tarefas =
                dados.tarefas || [];

        }

    } catch (erro) {

        console.error(
            "Erro ao carregar tarefas:",
            erro
        );

        tarefas = [];

    }


    lancamentos =
        JSON.parse(
            localStorage.getItem("lancamentos")
        ) || [];


    atualizarResumo();

}


// =====================================================
// VERIFICAR SE A TAREFA É DA SEMANA
// =====================================================

function tarefaEstaNaSemana(tarefa) {

    if (!tarefa.data) return false;


    const dataTarefa =
        new Date(tarefa.data + "T00:00:00");


    const hoje =
        new Date();

    hoje.setHours(0, 0, 0, 0);


    const inicioSemana =
        new Date(hoje);

    const diaSemana =
        hoje.getDay();


    const diferenca =
        diaSemana === 0
            ? 6
            : diaSemana - 1;


    inicioSemana.setDate(
        hoje.getDate() - diferenca
    );


    const fimSemana =
        new Date(inicioSemana);

    fimSemana.setDate(
        inicioSemana.getDate() + 6
    );


    return (
        dataTarefa >= inicioSemana &&
        dataTarefa <= fimSemana
    );
}


// =====================================================
// ATUALIZAR RESUMO
// =====================================================

function atualizarResumo() {

    const tarefasSemana =
        tarefas.filter(tarefa =>
            tarefaEstaNaSemana(tarefa)
        );


    // =================================================
    // TAREFAS CONCLUÍDAS
    // =================================================

    const tarefasConcluidas =
        tarefasSemana.filter(tarefa =>
            tarefa.concluida === true
        ).length;


    // =================================================
    // ESTUDOS
    // =================================================

    const atividadesEstudo =
        tarefasSemana.filter(function (tarefa) {

            const categoria =
                String(tarefa.categoria || "")
                    .toLowerCase();

            return (
                categoria === "estudos" ||
                categoria === "estudo" ||
                categoria === "academica"
            );

        }).length;


    // =================================================
    // TRABALHO
    // =================================================

    const atividadesTrabalho =
        tarefasSemana.filter(function (tarefa) {

            const categoria =
                String(tarefa.categoria || "")
                    .toLowerCase();

            return (
                categoria === "trabalho" ||
                categoria === "profissional"
            );

        }).length;


    // =================================================
    // TOTAL GASTO
    // =================================================

    const totalGasto =
        lancamentos
            .filter(function (lancamento) {

                return lancamento.tipo === "saida";

            })
            .reduce(function (total, lancamento) {

                return total +
                    Number(lancamento.valor || 0);

            }, 0);


    atualizarCards(
        tarefasConcluidas,
        atividadesEstudo,
        atividadesTrabalho,
        totalGasto
    );


    atualizarResumoAssistido(
        tarefasConcluidas,
        atividadesEstudo,
        atividadesTrabalho,
        totalGasto
    );
}


// =====================================================
// ATUALIZAR CARDS
// =====================================================

function atualizarCards(
    tarefasConcluidas,
    atividadesEstudo,
    atividadesTrabalho,
    totalGasto
) {

    const cards =
        document.querySelectorAll(".card-resumo");


    if (cards.length < 4) return;


    // =================================================
    // CARD 1
    // =================================================

    const indicadorTarefas =
        cards[0].querySelector(".indicador");


    if (indicadorTarefas) {

        indicadorTarefas.textContent =
            `${tarefasConcluidas} concluídas`;

    }


    // =================================================
    // CARD 2
    // =================================================

    const indicadorEstudo =
        cards[1].querySelector(".indicador");


    if (indicadorEstudo) {

        indicadorEstudo.textContent =
            `${atividadesEstudo} atividade${atividadesEstudo === 1 ? "" : "s"}`;

    }


    // =================================================
    // CARD 3
    // =================================================

    const indicadorTrabalho =
        cards[2].querySelector(".indicador");


    if (indicadorTrabalho) {

        if (atividadesTrabalho > 0) {

            indicadorTrabalho.textContent =
                `${atividadesTrabalho} atividade${atividadesTrabalho === 1 ? "" : "s"}`;

        } else {

            indicadorTrabalho.textContent =
                "Nenhuma atividade";

        }

    }


    // =================================================
    // CARD 4
    // =================================================

    const indicadorGasto =
        cards[3].querySelector(".indicador");


    if (indicadorGasto) {

        indicadorGasto.textContent =
            formatarMoeda(totalGasto);

    }

}


// =====================================================
// FORMATAR MOEDA
// =====================================================

function formatarMoeda(valor) {

    return Number(valor || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


// =====================================================
// RESUMO ASSISTIDO
// =====================================================

function atualizarResumoAssistido(
    tarefasConcluidas,
    atividadesEstudo,
    atividadesTrabalho,
    totalGasto
) {

    const titulo =
        document.querySelector(
            ".conteudo-assistido h2"
        );


    const texto =
        document.querySelector(
            ".conteudo-assistido p"
        );


    if (!titulo || !texto) return;


    // =================================================
    // SEM DADOS
    // =================================================

    if (
        tarefasConcluidas === 0 &&
        atividadesEstudo === 0 &&
        atividadesTrabalho === 0 &&
        totalGasto === 0
    ) {

        titulo.textContent =
            "Sua semana ainda está começando.";


        texto.textContent =
            "Adicione tarefas e lançamentos para acompanhar seu resumo semanal.";

        return;
    }


    // =================================================
    // COM DADOS
    // =================================================

    titulo.textContent =
        "Sua semana está em andamento.";


    texto.textContent =
        `Você concluiu ${tarefasConcluidas} ` +
        `${tarefasConcluidas === 1 ? "tarefa" : "tarefas"}, ` +
        `registrou ${atividadesEstudo} ` +
        `${atividadesEstudo === 1 ? "atividade de estudo" : "atividades de estudo"} ` +
        `e ${atividadesTrabalho} ` +
        `${atividadesTrabalho === 1 ? "atividade de trabalho" : "atividades de trabalho"}. ` +
        `Seus gastos registrados somam ${formatarMoeda(totalGasto)}.`;
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

}


// =====================================================
// INICIAR
// =====================================================

document.addEventListener("DOMContentLoaded", async function () {

    const logado = await mostrarUsuario();

    if (!logado) {
        return;
    }
        configurarLinksTemporarios();
        carregarDados();

    }
);