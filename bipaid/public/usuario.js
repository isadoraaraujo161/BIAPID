async function mostrarUsuario() {

    try {

        const resposta = await fetch("/api/usuario-atual");

        if (!resposta.ok) {
            window.location.href = "login.html";
            return null;
        }

        const dados = await resposta.json();
        const usuario = dados.usuario;

        if (!usuario || !usuario.nome) {
            window.location.href = "login.html";
            return null;
        }

        document.querySelectorAll(".nome-usuario").forEach(function (elemento) {
            elemento.textContent = usuario.nome;
        });

        const avatar = document.querySelector(".avatar-usuario");

        if (avatar) {

            const partes = usuario.nome.trim().split(/\s+/);
            let iniciais;

            if (partes.length === 1) {
                iniciais = partes[0].substring(0, 2);
            } else {
                iniciais = partes[0][0] + partes[partes.length - 1][0];
            }

            avatar.textContent = iniciais.toUpperCase();
        }

        return usuario;

    } catch (erro) {

        console.error(erro);
        window.location.href = "login.html";
        return null;

    }
}

async function sair() {

    try {
        await fetch("/api/logout", { method: "POST" });
    } catch (erro) {
        console.error(erro);
    } finally {
        window.location.href = "login.html";
    }
}