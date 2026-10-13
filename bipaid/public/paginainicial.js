// =====================================================
// ESTADO
// =====================================================

let tarefas = [];

// Dia/semana exibidos no card "Agenda de hoje"
let dataAgenda = new Date();
let modoAgenda = "dia"; // "dia" ou "semana"


// =====================================================
// CARREGAR TAREFAS
// =====================================================

async function carregarTarefas() {

    try {

        const resposta = await fetch("/api/tarefas");

        if (!resposta.ok) {
            throw new Error("Erro ao carregar tarefas.");
        }

        const dados = await resposta.json();

        tarefas = Array.isArray(dados)
            ? dados
            : dados.tarefas || [];

        mostrarAgenda();
        atualizarResumo();

    } catch (erro) {

        console.error("Erro ao carregar tarefas:", erro);

        const lista = document.getElementById("lista-tarefas");

        if (lista) {
            lista.innerHTML = `
                <p class="sem-tarefas">
                    Não foi possível carregar as tarefas.
                </p>
            `;
        }
    }
}


// =====================================================
// SAUDAÇÃO
// =====================================================

function mostrarPrimeiroNome() {

    const nome = document.querySelector(".botao-perfil .nome-usuario");
    const destino = document.getElementById("nome-boas-vindas");

    if (!nome || !destino) {
        return;
    }

    const primeiro = nome.textContent.trim().split(/\s+/)[0];

    if (primeiro && primeiro !== "Usuário") {
        destino.textContent = ", " + primeiro;
    }
}


// =====================================================
// AGENDA DE HOJE
// =====================================================

function formatarData(data) {

    return data.getFullYear() +
        "-" +
        String(data.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(data.getDate()).padStart(2, "0");
}


function inicioDaSemana(data) {

    // A semana começa na segunda-feira
    const diaDaSemana = (data.getDay() + 6) % 7;

    return new Date(
        data.getFullYear(),
        data.getMonth(),
        data.getDate() - diaDaSemana
    );
}


function formatarRotuloAgenda() {

    if (modoAgenda === "dia") {

        return dataAgenda.toLocaleDateString("pt-BR", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    const inicio = inicioDaSemana(dataAgenda);

    const fim = new Date(
        inicio.getFullYear(),
        inicio.getMonth(),
        inicio.getDate() + 6
    );

    const mesInicio = inicio.toLocaleDateString("pt-BR", { month: "long" });
    const mesFim = fim.toLocaleDateString("pt-BR", { month: "long" });

    if (inicio.getMonth() === fim.getMonth()) {
        return `${inicio.getDate()} – ${fim.getDate()} de ${mesFim} de ${fim.getFullYear()}`;
    }

    return `${inicio.getDate()} de ${mesInicio} – ${fim.getDate()} de ${mesFim} de ${fim.getFullYear()}`;
}


function mostrarAgenda() {

    const lista = document.getElementById("lista-tarefas");
    const titulo = document.getElementById("titulo-agenda");
    const rotulo = document.getElementById("data-agenda");

    if (!lista) {
        return;
    }

    const ehHoje = formatarData(dataAgenda) === formatarData(new Date());

    if (titulo) {

        if (modoAgenda === "semana") {
            titulo.textContent = "Agenda da semana";
        } else {
            titulo.textContent = ehHoje ? "Agenda de hoje" : "Agenda do dia";
        }
    }

    if (rotulo) {
        rotulo.textContent = formatarRotuloAgenda();
    }

    let filtradas;

    if (modoAgenda === "dia") {

        const alvo = formatarData(dataAgenda);

        filtradas = tarefas.filter(function (tarefa) {
            return tarefa.data === alvo;
        });

    } else {

        const inicio = inicioDaSemana(dataAgenda);

        const fim = new Date(
            inicio.getFullYear(),
            inicio.getMonth(),
            inicio.getDate() + 6
        );

        const primeiroDia = formatarData(inicio);
        const ultimoDia = formatarData(fim);

        filtradas = tarefas.filter(function (tarefa) {
            return tarefa.data >= primeiroDia && tarefa.data <= ultimoDia;
        });
    }

    filtradas.sort(function (a, b) {

        if (a.data !== b.data) {
            return a.data.localeCompare(b.data);
        }

        return (a.horario || "23:59").localeCompare(b.horario || "23:59");
    });

    lista.innerHTML = "";

    if (filtradas.length === 0) {

        let mensagem = "Nenhuma tarefa neste dia.";

        if (modoAgenda === "semana") {
            mensagem = "Nenhuma tarefa nesta semana.";
        } else if (ehHoje) {
            mensagem = "Nenhuma tarefa para hoje.";
        }

        lista.innerHTML = `<p class="sem-tarefas">${mensagem}</p>`;

        return;
    }

    filtradas.forEach(function (tarefa) {
        lista.appendChild(
            criarTarefa(tarefa, modoAgenda === "semana")
        );
    });
}


function configurarAgenda() {

    const anterior = document.getElementById("agenda-anterior");
    const proximo = document.getElementById("agenda-proxima");
    const modo = document.getElementById("modo-agenda");

    function mover(sentido) {

        const passo = modoAgenda === "semana" ? 7 : 1;

        dataAgenda = new Date(
            dataAgenda.getFullYear(),
            dataAgenda.getMonth(),
            dataAgenda.getDate() + sentido * passo
        );

        mostrarAgenda();
    }

    if (anterior) {
        anterior.addEventListener("click", function () {
            mover(-1);
        });
    }

    if (proximo) {
        proximo.addEventListener("click", function () {
            mover(1);
        });
    }

    if (modo) {
        modo.addEventListener("change", function () {
            modoAgenda = modo.value;
            mostrarAgenda();
        });
    }
}


// =====================================================
// CRIAR TAREFA NA TELA
// =====================================================

function criarTarefa(tarefa, mostrarData) {

    const elemento = document.createElement("div");

    elemento.className = "tarefa";

    if (tarefa.concluida) {
        elemento.classList.add("tarefa-concluida");
    }

    const chaveCategoria = (tarefa.categoria || "outros")
        .toLowerCase()
        .replace(/[^a-z]/g, "");

    const prioridade = obterClassePrioridade(tarefa.prioridade);

    let dataCurta = "";

    if (mostrarData && tarefa.data) {

        const partes = tarefa.data.split("-");

        dataCurta = `<small>${partes[2]}/${partes[1]}</small>`;
    }

    const descricao = tarefa.descricao
        ? `<span>${escaparHTML(tarefa.descricao)}</span>`
        : "";

    const acao = tarefa.concluida
        ? "Desmarcar tarefa"
        : "Concluir tarefa";

    elemento.innerHTML = `
        <button type="button" class="marcador" title="${acao}" aria-label="${acao}"></button>

        <span class="hora-tarefa">
            ${escaparHTML(tarefa.horario || "—")}
            ${dataCurta}
        </span>

        <div class="informacoes-tarefa">
            <strong>${escaparHTML(tarefa.titulo)}</strong>
            ${descricao}
        </div>

        <span class="categoria-tarefa cat-${chaveCategoria}">
            ${formatarCategoria(chaveCategoria)}
        </span>

        <span class="prioridade ${prioridade}">
            ${formatarPrioridade(prioridade)}
        </span>

        <a href="agenda.html#dia" class="menu-tarefa" title="Abrir na agenda" aria-label="Abrir na agenda">⋮</a>
    `;

    elemento
        .querySelector(".marcador")
        .addEventListener("click", function () {
            alterarConclusaoTarefa(tarefa.id, !tarefa.concluida);
        });

    return elemento;
}


// =====================================================
// ALTERAR CONCLUSÃO DA TAREFA
// =====================================================

async function alterarConclusaoTarefa(id, concluida) {

    try {

        const resposta = await fetch(`/api/tarefas/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                concluida: concluida
            })
        });

        if (!resposta.ok) {
            throw new Error("Erro ao atualizar tarefa.");
        }

        carregarTarefas();

    } catch (erro) {

        console.error("Erro ao atualizar tarefa:", erro);
    }
}


// =====================================================
// CARTÕES DE RESUMO
// =====================================================

function atualizarResumo() {

    const concluidas = tarefas.filter(function (tarefa) {
        return tarefa.concluida === true;
    }).length;

    // Pontos de atenção: tarefas urgentes que ainda não foram concluídas
    const atencao = tarefas.filter(function (tarefa) {
        return (
            !tarefa.concluida &&
            (tarefa.prioridade || "").toLowerCase() === "urgente"
        );
    }).length;

    const valorConcluidas = document.getElementById("valor-concluidas");
    const valorAtencao = document.getElementById("valor-atencao");

    if (valorConcluidas) {
        valorConcluidas.textContent = concluidas;
    }

    if (valorAtencao) {
        valorAtencao.textContent = atencao;
    }
}


// =====================================================
// AUXILIARES
// =====================================================

function formatarCategoria(categoria) {

    const categorias = {
        estudos: "Estudos",
        saude: "Saúde",
        pessoal: "Pessoal",
        trabalho: "Trabalho",
        outros: "Outros"
    };

    return categorias[categoria] || "Outros";
}


function formatarPrioridade(prioridade) {

    const prioridades = {
        normal: "Normal",
        importante: "Importante",
        urgente: "Urgente"
    };

    return prioridades[prioridade] || "Normal";
}


function obterClassePrioridade(prioridade) {

    const valor = (prioridade || "normal").toLowerCase();

    return ["normal", "importante", "urgente"].includes(valor)
        ? valor
        : "normal";
}


function escaparHTML(texto) {

    const div = document.createElement("div");

    div.textContent = texto || "";

    return div.innerHTML;
}


// =====================================================
// LINKS TEMPORÁRIOS
// =====================================================

function configurarLinksTemporarios() {

    document.querySelectorAll(
        '.link-menu[href="#"]'
    ).forEach(function (link) {

        link.addEventListener("click", function (evento) {
            evento.preventDefault();
        });
    });
}


// =====================================================
// INICIAR PÁGINA
// =====================================================

document.addEventListener("DOMContentLoaded", async function () {

    const logado = await mostrarUsuario();

    if (!logado) {
        return;
    }

    mostrarPrimeiroNome();
    configurarAgenda();
    configurarLinksTemporarios();
    carregarTarefas();

});