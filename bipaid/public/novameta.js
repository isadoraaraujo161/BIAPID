document.addEventListener("DOMContentLoaded", async function () {
    await mostrarUsuario();
});


const formulario = document.getElementById("formulario-meta");

if (formulario) {
    formulario.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        const nome = document.getElementById("nomeMeta").value.trim();
        const categoria = document.getElementById("categoriaMeta").value;
        const valorMeta = Number(
            document.getElementById("valorObjetivo").value
        );
        const valorAtual = Number(
            document.getElementById("valorAtual").value
        );
        const dataLimite = document.getElementById("dataLimite").value;
        const descricao = document
            .getElementById("descricaoMeta")
            .value.trim();

        if (!nome) {
            alert("Digite o nome da meta.");
            return;
        }

        if (!categoria) {
            alert("Selecione uma categoria.");
            return;
        }

        if (valorMeta <= 0) {
            alert("Digite um valor objetivo maior que zero.");
            return;
        }

        if (valorAtual < 0) {
            alert("O valor já alcançado não pode ser negativo.");
            return;
        }

        if (valorAtual > valorMeta) {
            alert(
                "O valor já alcançado não pode ser maior que o valor objetivo."
            );
            return;
        }

        if (!dataLimite) {
            alert("Escolha uma data limite.");
            return;
        }

        const botaoEnviar = formulario.querySelector('button[type="submit"]');
        botaoEnviar.disabled = true;

        try {

            const resposta = await fetch("/api/metas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nome,
                    categoria,
                    valorAtual,
                    valorMeta,
                    dataLimite,
                    descricao
                })
            });

            const dados = await resposta.json();

            if (!dados.sucesso) {
                alert(dados.mensagem || "Não foi possível criar a meta.");
                return;
            }

            alert("Meta criada com sucesso!");

            window.location.href = "metas.html";

        } catch (erro) {

            console.error("Erro:", erro);
            alert("Não foi possível conectar ao servidor. Verifique se o Node.js está funcionando.");

        } finally {

            botaoEnviar.disabled = false;

        }
    });
}