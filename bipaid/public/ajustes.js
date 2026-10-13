// =====================================================
// AJUSTES - BIPAID
// =====================================================

// Mapeamento do tamanho da fonte para a escala usada no CSS
const ESCALA_FONTE = {
    diminuir: "0.9",
    padrao: "1",
    aumentar: "1.15"
};


// =====================================================
// APLICAR PREFERÊNCIAS NA TELA
// =====================================================

function aplicarPreferencias(preferencias) {

    const raiz =
        document.documentElement;


    // =================================================
    // TEMA
    // =================================================

    const tema =
        preferencias.tema || "claro";

    raiz.setAttribute(
        "data-tema",
        tema
    );


    // =================================================
    // TAMANHO DA FONTE
    // =================================================

    const tamanhoFonte =
        preferencias.tamanhoFonte || "padrao";

    raiz.style.setProperty(
        "--escala-fonte",
        ESCALA_FONTE[tamanhoFonte] || "1"
    );


    // =================================================
    // ALTO CONTRASTE
    // =================================================

    if (preferencias.altoContraste) {

        raiz.setAttribute(
            "data-contraste",
            "alto"
        );

    } else {

        raiz.removeAttribute(
            "data-contraste"
        );
    }


    // =================================================
    // ÁREA DE TOQUE
    // =================================================

    if (preferencias.areaToque) {

        raiz.setAttribute(
            "data-area-toque",
            "grande"
        );

    } else {

        raiz.removeAttribute(
            "data-area-toque"
        );
    }


    // =================================================
    // MARCAR SELEÇÕES NA TELA
    // =================================================

    marcarTemaSelecionado(tema);
    marcarFonteSelecionada(tamanhoFonte);
    marcarAlternador("alternador-contraste", !!preferencias.altoContraste);
    marcarAlternador("alternador-toque", !!preferencias.areaToque);
}


// =====================================================
// MARCAR TEMA SELECIONADO
// =====================================================

function marcarTemaSelecionado(tema) {

    const botoes =
        document.querySelectorAll(".cartao-tema");

    botoes.forEach(function (botao) {

        if (botao.dataset.tema === tema) {

            botao.classList.add("selecionado");

        } else {

            botao.classList.remove("selecionado");
        }
    });
}


// =====================================================
// MARCAR FONTE SELECIONADA
// =====================================================

function marcarFonteSelecionada(tamanhoFonte) {

    const botoes =
        document.querySelectorAll(".opcao-fonte");

    botoes.forEach(function (botao) {

        if (botao.dataset.fonte === tamanhoFonte) {

            botao.classList.add("selecionado");

        } else {

            botao.classList.remove("selecionado");
        }
    });
}


// =====================================================
// MARCAR ALTERNADOR (TOGGLE)
// =====================================================

function marcarAlternador(id, ativo) {

    const botao =
        document.getElementById(id);

    if (!botao) return;

    if (ativo) {

        botao.classList.add("ativo");
        botao.setAttribute("aria-checked", "true");

    } else {

        botao.classList.remove("ativo");
        botao.setAttribute("aria-checked", "false");
    }
}


// =====================================================
// CARREGAR PREFERÊNCIAS DO SERVIDOR
// =====================================================

async function carregarPreferencias() {

    try {

        const resposta =
            await fetch("/api/preferencias");

        const dados =
            await resposta.json();

        if (dados.sucesso && dados.preferencias) {

            aplicarPreferencias(dados.preferencias);
        }

    } catch (erro) {

        console.error(
            "Erro ao carregar preferências:",
            erro
        );
    }
}


// =====================================================
// SALVAR PREFERÊNCIAS NO SERVIDOR
// =====================================================

async function salvarPreferencias(alteracoes) {

    try {

        const resposta =
            await fetch("/api/preferencias", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(alteracoes)
            });

        const dados =
            await resposta.json();

        if (!dados.sucesso) {

            console.error(
                "Não foi possível salvar as preferências:",
                dados.mensagem
            );
        }

    } catch (erro) {

        console.error(
            "Erro ao salvar preferências:",
            erro
        );
    }
}


// =====================================================
// CONFIGURAR SELETOR DE TEMA
// =====================================================

function configurarSeletorTema() {

    const botoes =
        document.querySelectorAll(".cartao-tema");

    botoes.forEach(function (botao) {

        botao.addEventListener("click", function () {

            const tema =
                botao.dataset.tema;

            document.documentElement.setAttribute(
                "data-tema",
                tema
            );

            marcarTemaSelecionado(tema);

            salvarPreferencias({ tema: tema });
        });
    });
}


// =====================================================
// CONFIGURAR SELETOR DE FONTE
// =====================================================

function configurarSeletorFonte() {

    const botoes =
        document.querySelectorAll(".opcao-fonte");

    botoes.forEach(function (botao) {

        botao.addEventListener("click", function () {

            const tamanhoFonte =
                botao.dataset.fonte;

            document.documentElement.style.setProperty(
                "--escala-fonte",
                ESCALA_FONTE[tamanhoFonte] || "1"
            );

            marcarFonteSelecionada(tamanhoFonte);

            salvarPreferencias({ tamanhoFonte: tamanhoFonte });
        });
    });
}


// =====================================================
// CONFIGURAR ALTERNADORES (TOGGLES) DE ACESSIBILIDADE
// =====================================================

function configurarAlternador(id, atributo, valorAtivo, chavePreferencia) {

    const botao =
        document.getElementById(id);

    if (!botao) return;

    botao.addEventListener("click", function () {

        const estaAtivo =
            botao.classList.contains("ativo");

        const novoEstado =
            !estaAtivo;

        marcarAlternador(id, novoEstado);

        if (novoEstado) {

            document.documentElement.setAttribute(
                atributo,
                valorAtivo
            );

        } else {

            document.documentElement.removeAttribute(
                atributo
            );
        }

        const alteracao = {};
        alteracao[chavePreferencia] = novoEstado;

        salvarPreferencias(alteracao);
    });
}


// =====================================================
// INICIAR PÁGINA
// =====================================================

document.addEventListener("DOMContentLoaded", async function () {

    const logado =
        await mostrarUsuario();

    if (!logado) {
        return;
    }

    configurarSeletorTema();
    configurarSeletorFonte();

    configurarAlternador(
        "alternador-contraste",
        "data-contraste",
        "alto",
        "altoContraste"
    );

    configurarAlternador(
        "alternador-toque",
        "data-area-toque",
        "grande",
        "areaToque"
    );

    carregarPreferencias();
});