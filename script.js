
const valorAlicatinho = 10;
const valorMolinha = 2;
const valorEspatula = 3;

const campoAlicatinhos = document.getElementById("alicatinhos");
const campoMolinhas = document.getElementById("molinhas");
const campoEspatulas = document.getElementById("espatulas");
const exibicaoTotal = document.getElementById("totalMes");
const botaoRegistrar = document.getElementById("btnRegistrar");
const listaHistorico = document.getElementById("listaHistorico");

// Recuperar registros salvos
let registros = JSON.parse(
    localStorage.getItem("meuGanhoRegistros")
) || [];

// Formatar dinheiro
function formatarDinheiro(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// Obter data local
function obterDataHoje() {
    const agora = new Date();

    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

// Salvar no navegador
function salvarRegistros() {
    localStorage.setItem(
        "meuGanhoRegistros",
        JSON.stringify(registros)
    );
}

// Atualizar dashboard e histórico
function atualizarDashboard() {

    const hoje = obterDataHoje();
    const mesAtual = hoje.substring(0, 7);

    const registrosDoMes = registros.filter(registro =>
        registro.data.startsWith(mesAtual)
    );

    const totalMes = registrosDoMes.reduce(
        (total, registro) => total + registro.total,
        0
    );

    exibicaoTotal.textContent = formatarDinheiro(totalMes);

    if (registros.length === 0) {
        listaHistorico.innerHTML =
            "<p>Nenhum registro encontrado.</p>";
        return;
    }

    const registrosOrdenados = [...registros].sort(
        (a, b) => b.data.localeCompare(a.data) || b.id - a.id
    );

    listaHistorico.innerHTML = "";

    registrosOrdenados.forEach(registro => {

        const dataFormatada = new Date(
            registro.data + "T12:00:00"
        ).toLocaleDateString("pt-BR");

        const item = document.createElement("div");
        item.className = "registro";

        item.innerHTML = `
            <div class="registro-info">
                <strong>${dataFormatada}</strong>
                <p>
                    Alicatinhos: ${registro.alicatinhos}
                    | Molinhas: ${registro.molinhas}
                    | Espátulas: ${registro.espatulas ?? 0}
                </p>
                <span class="registro-valor">
                    ${formatarDinheiro(registro.total)}
                </span>
                <br>
                <button class="btn-excluir">
                    Excluir registro
                </button>
            </div>
        `;

        const botaoExcluir = item.querySelector(".btn-excluir");

        botaoExcluir.addEventListener("click", function() {
            excluirRegistro(registro.id);
        });

        listaHistorico.appendChild(item);
    });
}

// 
// Registrar produção
botaoRegistrar.addEventListener("click", function() {

    const quantidadeAlicatinhos = Number(campoAlicatinhos.value);
    const quantidadeMolinhas = Number(campoMolinhas.value);
    const quantidadeEspatulas = Number(campoEspatulas.value);

    if (
        quantidadeAlicatinhos === 0 &&
        quantidadeMolinhas === 0 &&
        quantidadeEspatulas === 0
    ) {
        alert("Informe alguma produção!");
        return;
    }

    const ganhoAlicatinhos = quantidadeAlicatinhos * valorAlicatinho;
    const ganhoMolinhas = quantidadeMolinhas * valorMolinha;
    const ganhoEspatulas = quantidadeEspatulas * valorEspatula;

    const ganhoTotal = ganhoAlicatinhos + ganhoMolinhas + ganhoEspatulas;

    const novoRegistro = {
        id: Date.now(),
        data: obterDataHoje(),
        alicatinhos: quantidadeAlicatinhos,
        molinhas: quantidadeMolinhas,
        espatulas: quantidadeEspatulas,
        total: ganhoTotal
    };

    registros.push(novoRegistro);

    salvarRegistros();
    atualizarDashboard();

    campoAlicatinhos.value = 0;
    campoMolinhas.value = 0;
    campoEspatulas.value = 0;

    alert("Produção registrada com sucesso!");
});


// Excluir registro
function excluirRegistro(id) {

    const confirmar = confirm(
        "Deseja realmente excluir este registro?"
    );

    if (!confirmar) return;

    registros = registros.filter(
        registro => registro.id !== id
    );

    salvarRegistros();
    atualizarDashboard();
}

// Carregar dados ao abrir o aplicativo
atualizarDashboard();


// Registrar o Service Worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js")
            .then((registro) => {
                console.log("Service Worker ativado!", registro.scope);
            })
            .catch((erro) => {
                console.error("Erro ao ativar Service Worker:", erro);
            });
    });
}

