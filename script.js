function formatarValorMonetario(valor) {
  if (valor === null || valor === undefined || valor === "") return "";

  if (typeof valor === "number") {
    valor = valor.toFixed(2);
  } else {
    valor = parseFloat(valor.replace(/\./g, "").replace(",", "."));
    if (isNaN(valor)) return "";
    valor = valor.toFixed(2);
  }

  const partes = valor.split(".");
  partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return partes.join(",");
}

function formatarInput(input) {
  let valor = input.value.replace(/\D/g, "");
  if (valor === "") {
    input.value = "";
    return;
  }

  valor = (parseFloat(valor) / 100).toFixed(2);
  const partes = valor.split(".");
  partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  input.value = partes.join(",");
}

function limparCampos() {
  document.getElementById("valor").value = "";
  document.getElementById("entrada").value = "";
  document.getElementById("juros").value = "";
  document.getElementById("prazo").value = "";
  document.getElementById("resultado").innerHTML = "";
}

function calcular() {
  const parseBR = (valor) => parseFloat(valor.replace(/\./g, "").replace(",", "."));

  const valor = parseBR(document.getElementById("valor").value);
  const entrada = parseBR(document.getElementById("entrada").value);
  const taxaAnual = parseFloat(document.getElementById("juros").value);
  const prazo = parseInt(document.getElementById("prazo").value);
  const resultadoDiv = document.getElementById("resultado");

  if (isNaN(valor) || isNaN(entrada) || isNaN(taxaAnual) || isNaN(prazo)) {
    resultadoDiv.innerHTML = "<p>Preencha todos os campos corretamente.</p>";
    return;
  }

  if (valor <= 0 || entrada < 0) {
    resultadoDiv.innerHTML = "<p>Os valores devem ser maiores que zero.</p>";
    return;
  }

  if (entrada > valor) {
    resultadoDiv.innerHTML = "<p>O valor da entrada não pode ser maior que o valor do imóvel.</p>";
    return;
  }

  const percentualEntrada = entrada / valor;
  if (percentualEntrada < 0.2) {
    alert("Atenção: a entrada está abaixo de 20% do valor do imóvel. Isso pode impactar as condições do financiamento.");
  }

  const valorFinanciado = valor - entrada;
  const taxaMensal = taxaAnual / 12 / 100;

  // PRICE
  const parcelaPrice = valorFinanciado * (taxaMensal * Math.pow(1 + taxaMensal, prazo)) /
                       (Math.pow(1 + taxaMensal, prazo) - 1);
  const totalPrice = parcelaPrice * prazo;

  // SAC
  const amortizacao = valorFinanciado / prazo;
  let saldoDevedor = valorFinanciado;
  let totalSac = 0;
  let detalhesSac = `
    <table>
      <thead>
        <tr>
          <th>Parcela</th>
          <th>Prestação</th>
          <th>Juros</th>
          <th>Amortização</th>
          <th>Saldo Devedor</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (let i = 1; i <= prazo; i++) {
    const juros = saldoDevedor * taxaMensal;
    const parcela = amortizacao + juros;
    totalSac += parcela;

    detalhesSac += `
      <tr>
        <td>${i}</td>
        <td>R$ ${formatarValorMonetario(parcela)}</td>
        <td>R$ ${formatarValorMonetario(juros)}</td>
        <td>R$ ${formatarValorMonetario(amortizacao)}</td>
        <td>R$ ${formatarValorMonetario(saldoDevedor)}</td>
      </tr>
    `;

    saldoDevedor -= amortizacao;
  }

  detalhesSac += `
      </tbody>
    </table>
  `;

  resultadoDiv.innerHTML = `
    <h3>Resultado</h3>
    <p><strong>Valor financiado:</strong> R$ ${formatarValorMonetario(valorFinanciado)}</p>
    <p><strong>Sistema PRICE:</strong> Parcela fixa de R$ ${formatarValorMonetario(parcelaPrice)} – Total: R$ ${formatarValorMonetario(totalPrice)}</p>
    <p><strong>Sistema SAC:</strong> Parcelas decrescentes – Total estimado: R$ ${formatarValorMonetario(totalSac)}</p>
    <h4>Detalhamento das parcelas SAC:</h4>
    ${detalhesSac}
  `;
}
