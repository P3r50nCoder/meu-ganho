
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

// Exportar backup dos registros
function exportarBackup() {
    const backup = {
        aplicativo: "Meu Ganho",
        dataBackup: new Date().toISOString(),
        registros: registros
    };

    const arquivo = new Blob(
        [JSON.stringify(backup, null, 2)],
        { type: "application/json" }
    );

    const link = document.createElement("a");
    link.href = URL.createObjectURL(arquivo);
    link.download = `backup-meu-ganho-${obterDataHoje()}.json`;

    link.click();

    URL.revokeObjectURL(link.href);
}

document.getElementById("btnExportar").addEventListener("click", exportarBackup);

// Restaurar backup dos registros
document.getElementById("arquivoBackup").addEventListener("change", function(event) {
    const arquivo = event.target.files[0];

    if (!arquivo) return;

    const leitor = new FileReader();

    leitor.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);

            if (
    backup.aplicativo !== "Meu Ganho" ||
    !Array.isArray(backup.registros) ||
    !backup.registros.every(registro =>
        registro &&
        Number.isFinite(registro.id) &&
        /^\d{4}-\d{2}-\d{2}$/.test(registro.data) &&
        Number.isFinite(registro.alicatinhos) &&
        registro.alicatinhos >= 0 &&
        Number.isFinite(registro.molinhas) &&
        registro.molinhas >= 0 &&
        Number.isFinite(registro.espatulas) &&
        registro.espatulas >= 0 &&
        Number.isFinite(registro.total) &&
        registro.total >= 0
    )
) {
    alert("Arquivo de backup inválido ou com registros incompletos!");
    return;
}
            const confirmar = confirm(
                `Foram encontrados ${backup.registros.length} registros.\n\n` +
                "Deseja restaurar esse backup? Os registros atuais serão substituídos."
            );

            if (!confirmar) return;

            if (!confirmar) return;

// Criar backup dos dados atuais antes da restauração
const backupAtual = {
    aplicativo: "Meu Ganho",
    dataBackup: new Date().toISOString(),
    registros: registros
};

const arquivoAtual = new Blob(
    [JSON.stringify(backupAtual, null, 2)],
    { type: "application/json" }
);

const linkAtual = document.createElement("a");

linkAtual.href = URL.createObjectURL(arquivoAtual);
linkAtual.download = `backup-anterior-meu-ganho-${obterDataHoje()}.json`;

linkAtual.click();

URL.revokeObjectURL(linkAtual.href);

// Restaurar os novos registros
registros = backup.registros;

            registros = backup.registros;

            salvarRegistros();
            atualizarDashboard();

            alert("Backup restaurado com sucesso!");

        } catch (erro) {
            alert("Não foi possível ler esse arquivo de backup.");
        }

        event.target.value = "";
    };

    leitor.readAsText(arquivo);
});

  
function atualizarGrafico() {
    const filtro = document.getElementById("filtroGrafico");
    const grafico = document.getElementById("graficoBarras");
    const totalPeriodo = document.getElementById("totalPeriodo");
    const comparacaoMes = document.getElementById("comparacaoMes");
    const maiorGanho = document.getElementById("maiorGanho");

    if (!filtro || !grafico || !totalPeriodo ||
    !comparacaoMes || !maiorGanho) {
    return;
}

    const quantidadeMeses = Number(filtro.value);
    const agora = new Date();
    const meses = [];

    for (let i = quantidadeMeses - 1; i >= 0; i--) {
        const data = new Date(
            agora.getFullYear(),
            agora.getMonth() - i,
            1
        );

        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, "0");

        meses.push({
            chave: `${ano}-${mes}`,
            nome: data.toLocaleDateString("pt-BR", {
                month: "short"
            }).replace(".", ""),
            total: 0
        });
    }

    meses.forEach(mes => {
        mes.total = registros
            .filter(registro => registro.data.startsWith(mes.chave))
            .reduce((total, registro) => total + registro.total, 0);
    });

    const somaPeriodo = meses.reduce(
        (total, mes) => total + mes.total, 0
    );

    totalPeriodo.textContent = formatarDinheiro(somaPeriodo);

    // Identificar o mês com maior ganho
const maiorTotal = Math.max(
    ...meses.map(mes => mes.total)
);

const melhorMes = meses.find(
    mes => mes.total === maiorTotal && maiorTotal > 0
);

maiorGanho.textContent = melhorMes
    ? `${melhorMes.nome} - ${formatarDinheiro(melhorMes.total)}`
    : "Sem dados";

    const mesAtual = meses[meses.length - 1];
    const mesAnterior = meses[meses.length - 2];

    if (mesAnterior && mesAnterior.total > 0) {
        const variacao =
            ((mesAtual.total - mesAnterior.total) / mesAnterior.total) * 100;

        const sinal = variacao > 0 ? "+" : "";

        comparacaoMes.textContent =
            `${sinal}${variacao.toFixed(1)}%`;
    } else if (mesAtual.total > 0 && mesAnterior) {
        comparacaoMes.textContent = "Sem base anterior";
    } else {
        comparacaoMes.textContent = "Sem dados";
    }

    const maiorValor = Math.max(
        ...meses.map(mes => mes.total),
        1
    );

    grafico.innerHTML = "";

meses.forEach(mes => {
    const coluna = document.createElement("div");
    coluna.className = "grafico-coluna";

    // Destacar o mês atual
    const chaveMesAtual = obterDataHoje().substring(0, 7);

    if (mes.chave === chaveMesAtual) {
        coluna.classList.add("mes-atual");
    }

    // Destacar o mês com maior ganho
    if (maiorTotal > 0 && mes.total === maiorTotal) {
        coluna.classList.add("maior-ganho");
    }

    const valor = document.createElement("span");
    valor.className = "barra-valor";
    valor.textContent = formatarDinheiro(mes.total);

    const barra = document.createElement("div");
    barra.className = "grafico-barra";
    barra.style.height =
        `${(mes.total / maiorValor) * 100}%`;

    const nomeMes = document.createElement("span");
    nomeMes.className = "grafico-mes";
    nomeMes.textContent = mes.nome;

    coluna.appendChild(valor);
    coluna.appendChild(barra);
    coluna.appendChild(nomeMes);

    grafico.appendChild(coluna);
});
}
// Atualizar gráfico ao trocar o filtro
document.getElementById("filtroGrafico")
    ?.addEventListener("change", atualizarGrafico);

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

    atualizarGrafico();

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

