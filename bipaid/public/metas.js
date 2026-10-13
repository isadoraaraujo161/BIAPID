// =====================================================
// METAS
// =====================================================

let metas = [];


// =====================================================
// CARREGAR METAS
// =====================================================

async function carregarMetas() {

    try {

        const resposta = await fetch("/api/metas");

        if (!resposta.ok) {
            throw new Error("Erro ao carregar as metas.");
        }

        const dados = await resposta.json();

        metas = dados.metas || [];

    } catch (erro) {

        console.error(
            "Erro ao carregar as metas:",
            erro
        );

        metas = [];
    }


    mostrarMetas();
}


// =====================================================
// CALCULAR PORCENTAGEM
// =====================================================

function calcularPorcentagem(meta) {

    if (
        !meta.valorMeta ||
        meta.valorMeta <= 0
    ) {
        return 0;
    }


    const porcentagem =
        (
            Number(meta.valorAtual) /
            Number(meta.valorMeta)
        ) * 100;


    return Math.min(
        Math.max(porcentagem, 0),
        100
    );
}


// =====================================================
// FORMATAR VALOR
// =====================================================

function formatarValorMeta(meta, valor) {

    return Number(valor || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}


// =====================================================
// DEFINIR COR
// =====================================================

function definirCor(categoria) {

    if (categoria === "financeira") {
        return "roxo";
    }


    if (categoria === "academica") {
        return "azul";
    }


    if (categoria === "pessoal") {
        return "verde";
    }


    if (categoria === "profissional") {
        return "laranja";
    }


    return "roxo";
}


// =====================================================
// DEFINIR ÍCONE
// =====================================================

function definirIcone(categoria) {

    if (categoria === "financeira") {
        return "R$";
    }


    if (categoria === "academica") {
        return "▣";
    }


    if (categoria === "pessoal") {
        return "♡";
    }


    if (categoria === "profissional") {
        return "★";
    }


    return "◎";
}


// =====================================================
// NOME DA CATEGORIA
// =====================================================

function nomeCategoria(categoria) {

    if (categoria === "financeira") {
        return "Financeira";
    }


    if (categoria === "academica") {
        return "Acadêmica";
    }


    if (categoria === "pessoal") {
        return "Pessoal";
    }


    if (categoria === "profissional") {
        return "Profissional";
    }


    return "Outros";
}


// =====================================================
// MOSTRAR METAS
// =====================================================

function mostrarMetas() {

    const lista =
        document.querySelector(".lista-metas");


    if (!lista) return;


    lista.innerHTML = "";


    // =================================================
    // NENHUMA META
    // =================================================

    if (metas.length === 0) {

        lista.innerHTML = `
            <div class="aviso-sem-metas">

                <div class="icone-sem-metas">
                    ◎
                </div>

                <div class="texto-sem-metas">

                    <strong>
                        Você ainda não possui metas.
                    </strong>

                    <span>
                        Clique em "Nova meta" para criar seu primeiro objetivo.
                    </span>

                </div>

            </div>
        `;


        atualizarAvisoProgresso();

        return;
    }


    // =================================================
    // MOSTRAR CADA META
    // =================================================

    metas.forEach(function (meta, indice) {


        // =================================================
        // DADOS DA META
        // =================================================

        const porcentagem =
            calcularPorcentagem(meta);


        const cor =
            definirCor(meta.categoria);


        const icone =
            definirIcone(meta.categoria);


        const categoria =
            nomeCategoria(meta.categoria);


        // =================================================
        // CARD
        // =================================================

        const card =
            document.createElement("article");

        card.className =
            "card-meta";


        // =================================================
        // TOPO DO CARD
        // =================================================

        const topo =
            document.createElement("div");

        topo.className =
            "topo-meta";


        // =================================================
        // ÍCONE
        // =================================================

        const iconeMeta =
            document.createElement("div");

        iconeMeta.className =
            `icone-meta ${meta.categoria}`;

        iconeMeta.textContent =
            icone;


        // =================================================
        // LADO DIREITO
        // =================================================

        const ladoDireitoTopo =
            document.createElement("div");

        ladoDireitoTopo.className =
            "lado-direito-topo";


        // =================================================
        // BOTÃO X
        // =================================================

        const botaoExcluir =
            document.createElement("button");

        botaoExcluir.className =
            "botao-excluir-meta";

        botaoExcluir.type =
            "button";

        botaoExcluir.textContent =
            "×";

        botaoExcluir.title =
            "Excluir meta";


        // =================================================
        // EXCLUIR META
        // =================================================

        botaoExcluir.addEventListener(
            "click",
            async function (evento) {

                evento.preventDefault();

                evento.stopPropagation();


                const confirmar =
                    confirm(
                        `Deseja excluir a meta "${meta.nome}"?`
                    );


                if (!confirmar) {
                    return;
                }


                try {

                    const resposta = await fetch(`/api/metas/${meta.id}`, {
                        method: "DELETE"
                    });

                    if (!resposta.ok) {
                        throw new Error("Não foi possível excluir a meta.");
                    }

                    await carregarMetas();

                } catch (erro) {

                    console.error(erro);
                    alert("Não foi possível excluir a meta.");

                }
            }
        );


        // =================================================
        // PORCENTAGEM
        // =================================================

        const porcentagemMeta =
            document.createElement("strong");

        porcentagemMeta.className =
            `porcentagem-meta ${cor}`;

        porcentagemMeta.textContent =
            `${Math.round(porcentagem)}%`;


        // =================================================
        // X ACIMA DA PORCENTAGEM
        // =================================================

        ladoDireitoTopo.appendChild(
            botaoExcluir
        );


        ladoDireitoTopo.appendChild(
            porcentagemMeta
        );


        // =================================================
        // MONTAR TOPO
        // =================================================

        topo.appendChild(
            iconeMeta
        );


        topo.appendChild(
            ladoDireitoTopo
        );


        // =================================================
        // INFORMAÇÕES
        // =================================================

        const informacao =
            document.createElement("div");

        informacao.className =
            "informacao-meta";


        const nome =
            document.createElement("strong");

        nome.textContent =
            meta.nome;


        const valores =
            document.createElement("span");

        valores.textContent =
            `${formatarValorMeta(meta, meta.valorAtual)} de ${formatarValorMeta(meta, meta.valorMeta)}`;


        informacao.appendChild(
            nome
        );


        informacao.appendChild(
            valores
        );


        // =================================================
        // BARRA DE PROGRESSO
        // =================================================

        const barra =
            document.createElement("div");

        barra.className =
            "barra-progresso";


        const progresso =
            document.createElement("div");

        progresso.className =
            `progresso ${cor}`;


        progresso.style.width =
            `${porcentagem}%`;


        barra.appendChild(
            progresso
        );


        // =================================================
        // RODAPÉ
        // =================================================

        const rodape =
            document.createElement("div");

        rodape.className =
            "rodape-meta";


        const tipo =
            document.createElement("span");

        tipo.textContent =
            categoria;


        const detalhes =
            document.createElement("a");

        detalhes.href =
            "#";

        detalhes.textContent =
            "Ver detalhes";


        detalhes.addEventListener(
            "click",
            function (evento) {

                evento.preventDefault();


                abrirDetalhesMeta(
                    meta,
                    indice
                );
            }
        );


        rodape.appendChild(
            tipo
        );


        rodape.appendChild(
            detalhes
        );


        // =================================================
        // MONTAR CARD COMPLETO
        // =================================================

        card.appendChild(
            topo
        );


        card.appendChild(
            informacao
        );


        card.appendChild(
            barra
        );


        card.appendChild(
            rodape
        );


        lista.appendChild(
            card
        );

    });


    atualizarAvisoProgresso();
}


// =====================================================
// AVISO DE PROGRESSO
// =====================================================

function atualizarAvisoProgresso() {

    const aviso =
        document.querySelector(".aviso-progresso");


    if (!aviso) return;


    if (metas.length === 0) {

        aviso.style.display =
            "none";

        return;
    }


    aviso.style.display =
        "";
}


// =====================================================
// VER DETALHES
// =====================================================

function abrirDetalhesMeta(meta, indice) {

    const data =
        meta.dataLimite
            ? meta.dataLimite
                .split("-")
                .reverse()
                .join("/")
            : "Não definida";


    const mensagem =

        `Meta: ${meta.nome}\n\n` +

        `Categoria: ${nomeCategoria(meta.categoria)}\n` +

        `Valor atual: ${formatarValorMeta(meta, meta.valorAtual)}\n` +

        `Objetivo: ${formatarValorMeta(meta, meta.valorMeta)}\n` +

        `Progresso: ${Math.round(calcularPorcentagem(meta))}%\n` +

        `Data limite: ${data}`;


    alert(mensagem);
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
// INICIAR PÁGINA
// =====================================================

document.addEventListener("DOMContentLoaded", async function () {

    const logado = await mostrarUsuario();

    if (!logado) {
        return;
    }

    carregarMetas();
    configurarLinksTemporarios();

});