/* ==========================================================================
   VARIÁVEIS GLOBAIS (ESTADO DO SISTEMA)
   ========================================================================== */

var canalAtual = 'app';
var unidadeAtual = 'recife';
var categoriaAtual = 'all';
var modalidadeEntrega = 'pickup'; // 'pickup' ou 'local'
var pontosDoUsuario = 120;
var descontoAplicado = 0;
var cupomAtivo = null; // Armazena { codigo, pontos, valor } para estorno se o carrinho cair abaixo do mínimo
var carrinho = [];
var statusDoPedidoIndex = 1;

/* ==========================================================================
   BASE DE DADOS SIMULADA (COM DISPONIBILIDADE POR UNIDADE)
   ========================================================================== */

var produtos = [
    {
        id: 1,
        category: 'acaraje',
        name: 'Acarajé Tradicional Completo',
        price: 18.90,
        desc: 'Bolinho de feijão fradinho frito no dendê, vatapá, caruru, camarão seco e salada.',
        img: '🍤',
        unidades: ['recife', 'salvador', 'aracaju'] // Indisponível em Maceió (cozinha compacta)
    },
    {
        id: 2,
        category: 'tapioca',
        name: 'Tapioca Carne de Sol com Requeijão',
        price: 16.50,
        desc: 'Massa artesanal recheada com carne de sol desfiada e requeijão cremoso da terra.',
        img: '🫓',
        unidades: ['recife', 'salvador', 'aracaju', 'maceio']
    },
    {
        id: 3,
        category: 'cuscuz',
        name: 'Cuscuz Nordestino com Queijo Coalho',
        price: 14.00,
        desc: 'Flocada no vapor na cuscuzeira, manteiga de garrafa e queijo coalho tostado.',
        img: '🌽',
        unidades: ['recife', 'salvador', 'aracaju', 'maceio']
    },
    {
        id: 4,
        category: 'bebidas',
        name: 'Suco Natural de Caju (500ml)',
        price: 7.50,
        desc: 'Refrescante e feito com a polpa natural da fruta regional.',
        img: '🍹',
        unidades: ['recife', 'salvador', 'aracaju', 'maceio']
    },
    {
        id: 5,
        category: 'sobremesas',
        name: 'Cartola Pernambucana',
        price: 12.90,
        desc: 'Banana frita, queijo coalho assado, açúcar e canela polvilhados.',
        img: '🍌',
        unidades: ['recife', 'aracaju', 'maceio'] // Especialidade regional
    },
    {
        id: 6,
        category: 'acaraje',
        name: 'Abará na Folha de Bananeira',
        price: 17.50,
        desc: 'Cozido no vapor na folha da bananeira com vatapá e camarão.',
        img: '🍃',
        unidades: ['salvador', 'aracaju'] // Exclusivo unidades Bahia/Sergipe
    }
];

/* ==========================================================================
   INICIALIZAÇÃO
   ========================================================================== */

window.onload = function() {
    setViewMode('app');
    filtrarERenderizarCardapio();
    atualizarInterfaceCarrinho();
    atualizarBotoesRecompensas();
};

/* ==========================================================================
   MUDANÇA DE MODO, MODALIDADE PICK-UP E UNIDADE
   ========================================================================== */

function setViewMode(modo) {
    canalAtual = modo;
    var container = document.getElementById('app-container');
    var btnApp = document.getElementById('btn-app');
    var btnTotem = document.getElementById('btn-totem');
    var btnWeb = document.getElementById('btn-web');

    if (container) container.classList.remove('view-app', 'view-totem');

    if (btnApp) btnApp.className = "px-2.5 py-1 rounded text-xs font-semibold hover:bg-slate-800 transition";
    if (btnTotem) btnTotem.className = "px-2.5 py-1 rounded text-xs font-semibold hover:bg-slate-800 transition";
    if (btnWeb) btnWeb.className = "px-2.5 py-1 rounded text-xs font-semibold hover:bg-slate-800 transition";

    if (modo === 'app') {
        if (container) container.classList.add('view-app');
        if (btnApp) btnApp.className = "px-2.5 py-1 rounded text-xs font-semibold bg-amber-500 text-slate-950 shadow";
    } else if (modo === 'totem') {
        if (container) container.classList.add('view-totem');
        if (btnTotem) btnTotem.className = "px-2.5 py-1 rounded text-xs font-semibold bg-amber-500 text-slate-950 shadow";
    } else {
        if (btnWeb) btnWeb.className = "px-2.5 py-1 rounded text-xs font-semibold bg-amber-500 text-slate-950 shadow";
    }

    var orderChannel = document.getElementById('order-channel-display');
    if (orderChannel) orderChannel.innerText = modo.toUpperCase();
}

function selectDeliveryMode(modo) {
    modalidadeEntrega = modo;
    var btnPickup = document.getElementById('btn-mode-pickup');
    var btnLocal = document.getElementById('btn-mode-local');

    if (modo === 'pickup') {
        if (btnPickup) btnPickup.className = "py-1.5 px-2 rounded-lg border-2 border-blue-900 bg-blue-50 text-blue-950 font-bold flex items-center justify-center gap-1 transition";
        if (btnLocal) btnLocal.className = "py-1.5 px-2 rounded-lg border border-gray-200 bg-white text-gray-600 font-semibold flex items-center justify-center gap-1 transition";
    } else {
        if (btnLocal) btnLocal.className = "py-1.5 px-2 rounded-lg border-2 border-blue-900 bg-blue-50 text-blue-950 font-bold flex items-center justify-center gap-1 transition";
        if (btnPickup) btnPickup.className = "py-1.5 px-2 rounded-lg border border-gray-200 bg-white text-gray-600 font-semibold flex items-center justify-center gap-1 transition";
    }

    atualizarResumoEntregaPedido();
}

function atualizarResumoEntregaPedido() {
    var pickupDisplay = document.getElementById('order-pickup-display');
    var etaDisplay = document.getElementById('order-eta-display');

    if (modalidadeEntrega === 'pickup') {
        if (pickupDisplay) pickupDisplay.innerText = "Retirada Rápida (Pick-up Balcão)";
        if (etaDisplay) etaDisplay.innerText = "8 a 12 minutos (Via Expressa)";
    } else {
        if (pickupDisplay) pickupDisplay.innerText = "Consumo no Salão / Mesa";
        if (etaDisplay) etaDisplay.innerText = "12 a 18 minutos";
    }
}

function changeUnit(unidade) {
    unidadeAtual = unidade;
    var nomes = {
        recife: 'Recife (Boa Viagem)',
        salvador: 'Salvador (Barra)',
        aracaju: 'Aracaju (Atalaia)',
        maceio: 'Maceió (Pajuçara - Express)'
    };

    var nomeFormatado = nomes[unidade] || 'Unidade Selecionada';
    var elem = document.getElementById('order-unit-display');
    if (elem) elem.innerText = nomeFormatado;

    var noticeEl = document.getElementById('unit-menu-notice-text');
    if (noticeEl) {
        if (unidade === 'maceio') {
            noticeEl.innerHTML = 'Unidade Express <strong>' + nomeFormatado + '</strong>: alguns itens de fritura não estão disponíveis nesta operação.';
        } else {
            noticeEl.innerHTML = 'Exibindo cardápio regional disponível para a unidade <strong>' + nomeFormatado + '</strong>.';
        }
    }

    // Validação: remove itens do carrinho que não estão disponíveis na nova unidade selecionada
    var itensRemovidos = [];
    for (var i = carrinho.length - 1; i >= 0; i--) {
        var itemCarrinho = carrinho[i];
        // Ignora itens especiais (id 99 = combo promocional, id 98 = brinde fidelidade)
        if (itemCarrinho.id !== 99 && itemCarrinho.id !== 98) {
            var prodCatalogo = null;
            for (var j = 0; j < produtos.length; j++) {
                if (produtos[j].id === itemCarrinho.id) {
                    prodCatalogo = produtos[j];
                    break;
                }
            }
            if (prodCatalogo && prodCatalogo.unidades.indexOf(unidade) === -1) {
                itensRemovidos.push(itemCarrinho.name);
                carrinho.splice(i, 1);
            }
        }
    }

    if (itensRemovidos.length > 0) {
        atualizarInterfaceCarrinho();
        alert(
            "Atenção: O carrinho foi atualizado conforme o cardápio da unidade " + nomeFormatado + ".\n\n" +
            "Itens indisponíveis removidos:\n• " + itensRemovidos.join("\n• ")
        );
    }

    filtrarERenderizarCardapio();
}

function showTab(nomeDaAba) {
    var abas = ['menu', 'fidelity', 'track'];
    for (var i = 0; i < abas.length; i++) {
        var sec = document.getElementById("section-" + abas[i]);
        if (sec) sec.classList.add('hidden');
        var btn = document.getElementById("tab-" + abas[i]);
        if (btn) btn.className = "px-4 py-2 font-semibold text-sm border-b-2 border-transparent text-gray-600 hover:text-blue-900 transition flex items-center gap-2 whitespace-nowrap";
    }

    var secAtiva = document.getElementById("section-" + nomeDaAba);
    if (secAtiva) secAtiva.classList.remove('hidden');
    var btnAtivo = document.getElementById("tab-" + nomeDaAba);
    if (btnAtivo) btnAtivo.className = "px-4 py-2 font-bold text-sm border-b-2 border-blue-900 text-blue-900 transition flex items-center gap-2 whitespace-nowrap";
}

/* ==========================================================================
   CARDÁPIO E FILTROS DINÂMICOS (POR UNIDADE E CATEGORIA)
   ========================================================================== */

function filtrarERenderizarCardapio() {
    var filtrados = [];
    for (var i = 0; i < produtos.length; i++) {
        var p = produtos[i];
        var pertenceCategoria = (categoriaAtual === 'all' || p.category === categoriaAtual);
        if (pertenceCategoria) {
            filtrados.push(p);
        }
    }
    renderizarProdutos(filtrados);
}

function renderizarProdutos(lista) {
    var divGrid = document.getElementById('products-grid');
    if (!divGrid) return;
    
    var html = "";
    for (var i = 0; i < lista.length; i++) {
        var p = lista[i];
        var preco = p.price.toFixed(2).replace('.', ',');
        var disponivelNaUnidade = p.unidades.indexOf(unidadeAtual) !== -1;

        var botaoHtml = disponivelNaUnidade
            ? '<button onclick="addToCart(' + p.id + ')" class="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1 transition">' +
                  '<i class="fa-solid fa-plus text-[10px]"></i> Adicionar' +
              '</button>'
            : '<span class="bg-slate-200 text-slate-500 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold cursor-not-allowed">' +
                  'Indisponível nesta loja' +
              '</span>';

        var cardOpacidade = disponivelNaUnidade ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-75';

        html += '<div class="' + cardOpacidade + ' rounded-xl border p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3">' +
                    '<div class="space-y-2">' +
                        '<div class="w-full h-28 bg-slate-100 rounded-lg flex items-center justify-center text-4xl shadow-inner relative">' +
                            p.img +
                            (!disponivelNaUnidade ? '<span class="absolute top-2 right-2 bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Fora do cardápio local</span>' : '') +
                        '</div>' +
                        '<h4 class="font-bold text-sm text-gray-800">' + p.name + '</h4>' +
                        '<p class="text-xs text-gray-500 leading-snug">' + p.desc + '</p>' +
                    '</div>' +
                    '<div class="flex items-center justify-between pt-2 border-t border-gray-100">' +
                        '<span class="font-extrabold text-sm text-blue-900">R$ ' + preco + '</span>' +
                        botaoHtml +
                    '</div>' +
                '</div>';
    }
    divGrid.innerHTML = html;
}

function filterCategory(categoria, btnElement) {
    categoriaAtual = categoria;

    // 1. Reseta o estilo de todos os botões para inativo
    var botoes = document.querySelectorAll('.cat-btn');
    for (var i = 0; i < botoes.length; i++) {
        botoes[i].className = "cat-btn bg-white text-gray-700 hover:bg-slate-100 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border border-slate-200 transition";
    }

    // 2. Aplica o destaque Azul Marinho + Letras Brancas no botão selecionado
    if (btnElement) {
        btnElement.className = "cat-btn bg-blue-900 text-white font-bold px-4 py-1.5 rounded-full text-xs whitespace-nowrap shadow-sm border border-blue-950 transition";
    }

    // 3. Filtra respeitando a unidade e a categoria selecionada
    filtrarERenderizarCardapio();
}

/* ==========================================================================
   CARRINHO E PROMOÇÕES
   ========================================================================== */

function addToCart(idProduto) {
    var itemExistente = null;
    for (var i = 0; i < carrinho.length; i++) {
        if (carrinho[i].id === idProduto) {
            itemExistente = carrinho[i];
            break;
        }
    }

    if (itemExistente) {
        itemExistente.qty += 1;
    } else {
        for (var j = 0; j < produtos.length; j++) {
            if (produtos[j].id === idProduto) {
                carrinho.push({
                    id: produtos[j].id,
                    name: produtos[j].name,
                    price: produtos[j].price,
                    desc: produtos[j].desc,
                    img: produtos[j].img,
                    qty: 1
                });
                break;
            }
        }
    }
    atualizarInterfaceCarrinho();
}

function addPromoCombo() {
    var comboExistente = null;
    for (var i = 0; i < carrinho.length; i++) {
        if (carrinho[i].id === 99) {
            comboExistente = carrinho[i];
            break;
        }
    }

    if (comboExistente) {
        comboExistente.qty += 1;
    } else {
        carrinho.push({ id: 99, name: 'Pôr do Sol Nordestino ✨', price: 35.90, qty: 1, img: '📦' });
    }
    
    atualizarInterfaceCarrinho();
    toggleCartModal();
}

function updateCartQty(idProduto, valor) {
    for (var i = 0; i < carrinho.length; i++) {
        if (carrinho[i].id === idProduto) {
            carrinho[i].qty += valor;
            if (carrinho[i].qty <= 0) {
                // Se o cliente remover a Cocada Prêmio manualmente, estorna os 150 pontos
                if (idProduto === 98) {
                    pontosDoUsuario += 150;
                    atualizarExibicaoPontos();
                }
                carrinho.splice(i, 1);
            }
            break;
        }
    }
    atualizarInterfaceCarrinho();
}

function atualizarExibicaoPontos() {
    var ptsEl = document.getElementById('user-points');
    var ptsBig = document.getElementById('fidelity-points-big');

    if (ptsEl) ptsEl.innerText = pontosDoUsuario + " pts";
    if (ptsBig) ptsBig.innerText = pontosDoUsuario;
}

function atualizarInterfaceCarrinho() {
    var qtdTotal = 0;
    var subtotal = 0;

    for (var i = 0; i < carrinho.length; i++) {
        qtdTotal += carrinho[i].qty;
        subtotal += (carrinho[i].price * carrinho[i].qty);
    }

    // Validação de regra de cupom: se o subtotal cair abaixo do mínimo exigido, estorna o cupom
    if (cupomAtivo) {
        var minimoExigido = (cupomAtivo.codigo === 'R10') ? 30 : 50;
        if (subtotal < minimoExigido) {
            pontosDoUsuario += cupomAtivo.pontos;
            descontoAplicado = 0;
            cupomAtivo = null;
            atualizarExibicaoPontos();
            alert("O cupom de desconto foi removido e seus pontos foram devolvidos, pois o subtotal ficou abaixo do valor mínimo exigido (R$ " + minimoExigido + ",00).");
        }
    }

    var countEl = document.getElementById('cart-count');
    if (countEl) countEl.innerText = qtdTotal;

    var container = document.getElementById('cart-items');
    if (container) {
        if (carrinho.length === 0) {
            container.innerHTML = '<div class="text-center py-10 text-gray-400 text-xs"><i class="fa-solid fa-basket-shopping text-3xl mb-2"></i><p>Seu carrinho está vazio.</p></div>';
        } else {
            var html = "";
            for (var j = 0; j < carrinho.length; j++) {
                var item = carrinho[j];
                var totalItem = (item.price * item.qty).toFixed(2).replace('.', ',');
                var precoTexto = item.price === 0 ? 'Grátis (Fidelidade)' : 'R$ ' + totalItem;

                html += '<div class="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">' +
                            '<div class="flex items-center space-x-2">' +
                                '<span>' + item.img + '</span>' +
                                '<div><p class="font-bold text-gray-800">' + item.name + '</p><p class="text-gray-500">' + precoTexto + '</p></div>' +
                            '</div>' +
                            '<div class="flex items-center space-x-2">' +
                                '<button onclick="updateCartQty(' + item.id + ', -1)" class="w-6 h-6 bg-white border rounded font-bold text-gray-600">-</button>' +
                                '<span class="font-bold">' + item.qty + '</span>' +
                                (item.id === 98 ? '' : '<button onclick="updateCartQty(' + item.id + ', 1)" class="w-6 h-6 bg-white border rounded font-bold text-gray-600">+</button>') +
                            '</div>' +
                        '</div>';
            }
            container.innerHTML = html;
        }
    }

    var totalFinal = subtotal - descontoAplicado;
    if (totalFinal < 0) totalFinal = 0;

    var subEl = document.getElementById('cart-subtotal');
    var descEl = document.getElementById('cart-discount');
    var totEl = document.getElementById('cart-total');

    if (subEl) subEl.innerText = "R$ " + subtotal.toFixed(2).replace('.', ',');
    if (descEl) descEl.innerText = "- R$ " + descontoAplicado.toFixed(2).replace('.', ',');
    if (totEl) totEl.innerText = "R$ " + totalFinal.toFixed(2).replace('.', ',');

    atualizarBotoesRecompensas();
}

function toggleCartModal() {
    toggleModal('cart-modal');
}

/* ==========================================================================
   VERIFICAÇÃO LGPD E ATUALIZAÇÃO DOS BOTÕES DE RECOMPENSA
   ========================================================================== */

function isFidelidadePermitidaLGPD() {
    var optFidelity = document.getElementById('lgpd-opt-fidelity');
    return optFidelity ? optFidelity.checked : true;
}

function atualizarBotoesRecompensas() {
    var fidelidadeAtiva = isFidelidadePermitidaLGPD();
    var warningEl = document.getElementById('fidelity-lgpd-warning');
    if (warningEl) {
        if (fidelidadeAtiva) {
            warningEl.classList.add('hidden');
        } else {
            warningEl.classList.remove('hidden');
        }
    }

    var subtotalCarrinho = 0;
    for (var i = 0; i < carrinho.length; i++) {
        subtotalCarrinho += (carrinho[i].price * carrinho[i].qty);
    }

    var estiloAtivo = "mt-4 bg-blue-900 hover:bg-slate-900 text-white py-2 rounded-lg text-xs font-bold transition cursor-pointer";
    var estiloInativo = "mt-4 bg-gray-200 text-gray-500 py-2 rounded-lg text-xs font-bold cursor-not-allowed";

    // Card 1: R$ 10,00 (Requer LGPD ativa, 100 Pts E subtotal >= R$ 30,00)
    var btnR10 = document.getElementById('btn-reward-r10');
    if (btnR10) {
        if (!fidelidadeAtiva) {
            btnR10.className = estiloInativo;
            btnR10.innerText = "Bloqueado (LGPD)";
            btnR10.disabled = true;
        } else if (pontosDoUsuario >= 100 && subtotalCarrinho >= 30 && !cupomAtivo) {
            btnR10.className = estiloAtivo;
            btnR10.innerText = "Resgatar Item";
            btnR10.disabled = false;
        } else {
            btnR10.className = estiloInativo;
            btnR10.innerText = cupomAtivo ? "Cupom já aplicado" : "Condição não atendida";
            btnR10.disabled = true;
        }
    }

    // Card 2: Cocada Cremosa (Requer LGPD ativa e 150 Pts)
    var btnCocada = document.getElementById('btn-reward-cocada');
    if (btnCocada) {
        if (!fidelidadeAtiva) {
            btnCocada.className = estiloInativo;
            btnCocada.innerText = "Bloqueado (LGPD)";
            btnCocada.disabled = true;
        } else if (pontosDoUsuario >= 150) {
            btnCocada.className = estiloAtivo;
            btnCocada.innerText = "Resgatar Item";
            btnCocada.disabled = false;
        } else {
            btnCocada.className = estiloInativo;
            btnCocada.innerText = "Condição não atendida";
            btnCocada.disabled = true;
        }
    }

    // Card 3: R$ 25,00 (Requer LGPD ativa, 220 Pts E subtotal >= R$ 50,00)
    var btnR25 = document.getElementById('btn-reward-r25');
    if (btnR25) {
        if (!fidelidadeAtiva) {
            btnR25.className = estiloInativo;
            btnR25.innerText = "Bloqueado (LGPD)";
            btnR25.disabled = true;
        } else if (pontosDoUsuario >= 220 && subtotalCarrinho >= 50 && !cupomAtivo) {
            btnR25.className = estiloAtivo;
            btnR25.innerText = "Resgatar Item";
            btnR25.disabled = false;
        } else {
            btnR25.className = estiloInativo;
            btnR25.innerText = cupomAtivo ? "Cupom já aplicado" : "Condição não atendida";
            btnR25.disabled = true;
        }
    }
}

/* ==========================================================================
   RESGATE DE FIDELIDADE
   ========================================================================== */

function redeemReward(codigoCupom, custoEmPontos, valorDoDesconto) {
    if (!isFidelidadePermitidaLGPD()) {
        alert("O resgate está desativado devido à sua preferência de privacidade (LGPD). Ative o Programa de Fidelidade nas configurações de privacidade.");
        return;
    }

    var subtotalCarrinho = 0;
    for (var i = 0; i < carrinho.length; i++) {
        subtotalCarrinho += (carrinho[i].price * carrinho[i].qty);
    }

    if (codigoCupom === 'R10' && subtotalCarrinho < 30) {
        alert("Resgate não permitido, pois o pedido é inferior a R$ 30,00.");
        return;
    }

    if (codigoCupom === 'R25' && subtotalCarrinho < 50) {
        alert("Resgate não permitido, pois o pedido é inferior a R$ 50,00.");
        return;
    }

    if (pontosDoUsuario >= custoEmPontos) {
        pontosDoUsuario -= custoEmPontos;

        if (codigoCupom === 'ITEM_COCADA') {
            var cocadaExistente = null;
            for (var j = 0; j < carrinho.length; j++) {
                if (carrinho[j].id === 98) {
                    cocadaExistente = carrinho[j];
                    break;
                }
            }
            if (cocadaExistente) {
                cocadaExistente.qty += 1;
            } else {
                carrinho.push({
                    id: 98,
                    name: 'Cocada Cremosa (Prêmio Fidelidade)',
                    price: 0.00,
                    qty: 1,
                    img: '🥥'
                });
            }
        } else {
            descontoAplicado = valorDoDesconto;
            cupomAtivo = {
                codigo: codigoCupom,
                pontos: custoEmPontos,
                valor: valorDoDesconto
            };
        }

        atualizarExibicaoPontos();
        atualizarInterfaceCarrinho();

        if (codigoCupom === 'ITEM_COCADA') {
            alert("Recompensa resgatada com sucesso! Uma Cocada Cremosa gratuita foi adicionada ao seu carrinho.");
        } else {
            alert("Cupom resgatado com sucesso! Desconto de R$ " + valorDoDesconto + ",00 aplicado ao carrinho.");
        }
    } else {
        alert("Você não tem pontos suficientes para resgatar este cupom.");
    }
}

/* ==========================================================================
   PAGAMENTO, SIMULAÇÃO DE FALHA E PONTUAÇÃO LGPD
   ========================================================================== */

function startCheckout() {
    if (carrinho.length === 0) {
        alert('Adicione ao menos um item ao carrinho.');
        return;
    }
    // Esconde alerta de erro anterior ao abrir o modal de pagamento
    var errAlert = document.getElementById('payment-error-alert');
    if (errAlert) errAlert.classList.add('hidden');

    toggleCartModal();
    toggleModal('payment-modal');
}

function selectPayMethod(metodo) {
    var btnPix = document.getElementById('pay-method-pix');
    var btnCard = document.getElementById('pay-method-card');
    var divDetalhes = document.getElementById('pay-details');

    // Esconde alerta de erro ao trocar o método de pagamento
    var errAlert = document.getElementById('payment-error-alert');
    if (errAlert) errAlert.classList.add('hidden');

    if (metodo === 'pix') {
        if (btnPix) btnPix.className = "border-2 border-blue-900 bg-slate-50 p-3 rounded-xl flex flex-col items-center justify-center text-xs font-bold text-gray-800 hover:bg-slate-100 transition";
        if (btnCard) btnCard.className = "border-2 border-gray-200 p-3 rounded-xl flex flex-col items-center justify-center text-xs font-bold text-gray-800 hover:bg-slate-100 transition";
        if (divDetalhes) {
            divDetalhes.innerHTML = '<div id="pix-display" class="space-y-2">' +
                '<p class="text-xs font-medium text-gray-600">Escaneie o código QR com o app do seu banco:</p>' +
                '<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=RaizesNordesteMockPayment" alt="QR Code PIX" class="mx-auto border-4 border-white shadow rounded-lg w-32 h-32">' +
                '<p class="text-[10px] text-gray-400 font-mono">00020126360014BR.GOV.BCB.PIX0114RAIZESNORDESTE2026</p>' +
            '</div>';
        }
    } else {
        if (btnCard) btnCard.className = "border-2 border-blue-900 bg-slate-50 p-3 rounded-xl flex flex-col items-center justify-center text-xs font-bold text-gray-800 hover:bg-slate-100 transition";
        if (btnPix) btnPix.className = "border-2 border-gray-200 p-3 rounded-xl flex flex-col items-center justify-center text-xs font-bold text-gray-800 hover:bg-slate-100 transition";
        if (divDetalhes) {
            divDetalhes.innerHTML = '<div class="space-y-2 text-left">' +
                '<input type="text" placeholder="Número do Cartão" value="4532 •••• •••• 8921" class="w-full border p-2 rounded text-xs">' +
                '<div class="flex gap-2">' +
                    '<input type="text" placeholder="Validade (MM/AA)" value="12/28" class="w-1/2 border p-2 rounded text-xs">' +
                    '<input type="text" placeholder="CVV" value="882" class="w-1/2 border p-2 rounded text-xs">' +
                '</div>' +
            '</div>';
        }
    }
}

function simulatePaymentFailure() {
    var btnFail = document.getElementById('btn-fail-pay');
    var errAlert = document.getElementById('payment-error-alert');
    
    if (btnFail) btnFail.innerHTML = '<i class="fa-solid fa-circle-notch animate-spin"></i> Comunicando com Gateway...';
    if (errAlert) errAlert.classList.add('hidden');

    setTimeout(function() {
        if (btnFail) btnFail.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Simular Falha / Recusa no Gateway';
        if (errAlert) errAlert.classList.remove('hidden');
    }, 1000);
}

function processSimulatedPayment() {
    var btn = document.getElementById('btn-confirm-pay');
    var errAlert = document.getElementById('payment-error-alert');
    if (errAlert) errAlert.classList.add('hidden');
    if (btn) btn.innerHTML = '<i class="fa-solid fa-circle-notch animate-spin"></i> Processando Gateway...';
    
    setTimeout(function() {
        if (btn) btn.innerHTML = 'Confirmar Pagamento Simulado';
        toggleModal('payment-modal');
        
        var fidelidadeAtiva = isFidelidadePermitidaLGPD();
        var pontosGanhos = 0;

        if (fidelidadeAtiva) {
            var subtotalBruto = 0;
            var bonusCombo = 0;

            for (var i = 0; i < carrinho.length; i++) {
                var item = carrinho[i];
                if (item.id === 99) {
                    bonusCombo += (50 * item.qty);
                } else {
                    subtotalBruto += (item.price * item.qty);
                }
            }

            var valorLiquido = subtotalBruto - descontoAplicado;
            if (valorLiquido < 0) valorLiquido = 0;

            pontosGanhos = Math.floor(valorLiquido) + bonusCombo;
            pontosDoUsuario += pontosGanhos;
            atualizarExibicaoPontos();
        }

        // Atualiza número de pedido aleatório e detalhes de retirada
        var orderIdEl = document.getElementById('active-order-id');
        if (orderIdEl) orderIdEl.innerText = "#RN-" + Math.floor(10000 + Math.random() * 90000);
        atualizarResumoEntregaPedido();

        carrinho = [];
        descontoAplicado = 0;
        cupomAtivo = null;
        atualizarInterfaceCarrinho();

        showTab('track');

        if (fidelidadeAtiva) {
            alert("Pagamento aprovado! Você ganhou +" + pontosGanhos + " pontos Raízes.");
        } else {
            alert("Pagamento aprovado! Observação: O acúmulo de pontos está desativado conforme sua preferência de privacidade (LGPD).");
        }
    }, 1500);
}

/* ==========================================================================
   STATUS DO PEDIDO, LGPD E MODAIS
   ========================================================================== */

function advanceOrderStatus() {
    var badge = document.getElementById('order-status-badge');
    var barra = document.getElementById('status-progress-bar');
    
    if (statusDoPedidoIndex === 0) {
        statusDoPedidoIndex = 1;
        if (badge) {
            badge.className = "bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full self-start md:self-auto";
            badge.innerText = "Em Preparo na Cozinha 🍳";
        }
        if (barra) barra.style.width = "66%";
    } else if (statusDoPedidoIndex === 1) {
        statusDoPedidoIndex = 2;
        if (badge) {
            badge.className = "bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full self-start md:self-auto";
            badge.innerText = "Pronto para Retirada 🔔";
        }
        if (barra) barra.style.width = "100%";
    } else {
        statusDoPedidoIndex = 0;
        if (badge) {
            badge.className = "bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full self-start md:self-auto";
            badge.innerText = "Recebido no Sistema 📩";
        }
        if (barra) barra.style.width = "33%";
    }
}

function acceptLGPD() {
    var banner = document.getElementById('lgpd-banner');
    if (banner) banner.classList.add('hidden');
}

function saveLGPDPreferences() {
    toggleModal('lgpd-modal');
    acceptLGPD();
    atualizarBotoesRecompensas();

    if (!isFidelidadePermitidaLGPD()) {
        alert("Preferências salvas: O acúmulo e resgate de pontos de fidelidade foram desativados conforme sua escolha de privacidade (LGPD).");
    }
}

function loginUser() {
    var input = document.getElementById('input-user-name');
    var lgpdCheck = document.getElementById('input-user-lgpd');
    if (!input) return;

    if (lgpdCheck && !lgpdCheck.checked) {
        alert("Para realizar a identificação e participar do programa de fidelidade, é necessário concordar com o termo de privacidade (LGPD).");
        return;
    }

    if (input.value.trim() !== "") {
        var primeiroNome = input.value.trim().split(' ')[0];
        var display = document.getElementById('user-name-display');
        if (display) display.innerText = primeiroNome;
        toggleModal('user-modal');
    } else {
        alert("Por favor, informe seu nome completo.");
    }
}

function toggleModal(id) {
    var elem = document.getElementById(id);
    if (elem) elem.classList.toggle('hidden');
}