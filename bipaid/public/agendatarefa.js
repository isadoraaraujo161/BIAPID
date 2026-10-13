document.addEventListener("DOMContentLoaded", async function () {
    await mostrarUsuario();
});


const formulario = document.getElementById("formulario-tarefa");

if (formulario) {
    formulario.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        // Pega os valores preenchidos no formulário
        const titulo = document.getElementById("titulo").value.trim();
        const descricao = document.getElementById("descricao").value.trim();
        const data = document.getElementById("data").value;
        const horario = document.getElementById("horario").value;
        const categoria = document.getElementById("categoria").value;
        const prioridade = document.getElementById("prioridade").value;

        // Verifica se os campos obrigatórios foram preenchidos
        if (!titulo) {
            alert("Digite o nome da tarefa.");
            return;
        }

        if (!data) {
            alert("Escolha uma data para a tarefa.");
            return;
        }

        // Monta a tarefa
        const tarefa = {
            titulo: titulo,
            descricao: descricao,
            data: data,
            horario: horario,
            categoria: categoria,
            prioridade: prioridade
        };

        // ===== NOVO: pega o botão e desabilita antes de enviar =====
        const botaoEnviar = formulario.querySelector('button[type="submit"]');
        botaoEnviar.disabled = true;

        try {
            // Envia a tarefa para o Node.js
            const resposta = await fetch("/api/tarefas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(tarefa)
            });

            const dados = await resposta.json();

            // Verifica se o servidor aceitou a tarefa
            if (!dados.sucesso) {
                alert(dados.mensagem || "Não foi possível adicionar a tarefa.");
                return;
            }

            // Tarefa adicionada
            alert("Tarefa adicionada com sucesso!");

            // Volta para a agenda no modo Dia
            window.location.href = "agenda.html#dia";

        } catch (erro) {
            console.error("Erro:", erro);

            alert(
                "Não foi possível conectar ao servidor. " +
                "Verifique se o Node.js está funcionando."
            );

        } finally {
            // ===== NOVO: reabilita o botão, aconteça o que acontecer =====
            botaoEnviar.disabled = false;
        }
    });
}