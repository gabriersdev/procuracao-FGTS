import {isEmpty, verifyCPF, zeroLeft} from './modulos/utilitarios.js';

(() => {
  try {
    pdf2htmlEX.defaultViewer = new pdf2htmlEX.Viewer({});
  } catch (error) {
    console.log('Erro ao inicializar viewer: %s', error);
  }
  
  function showModalEditInfos() {
    const modal = document.querySelector('#modal-editar-informacoes');
    modal.showModal();
    setTimeout(() => {
      $(modal).find('input').first().focus();
    }, 0);
  }
  
  function send(form) {
    const $form = $(form);
    let inputs = $('input[data-input]').map(function() {
      return $(this).attr('data-input');
    }).get();
    
    const formData = inputs.map(inputName => [
      inputName,
      $form.find(`[data-input="${inputName}"]`).val()
    ]);
    
    let itsAllOk = true;
    const cnpj = formData.find(f => f[0] === "cnpj");
    const companyName = formData.find(f => f[0] === "companyName");
    const city = formData.find(f => f[0] === "city");
    const signDate = formData.find(f => f[0] === "signDate");
    
    if (signDate && signDate[1]) {
      const date = new Date(`${signDate[1]}T00:00:00-03:00`);
      if (isNaN(date.getTime())) {
        alert("A data de assinatura não é válida!");
        itsAllOk = false;
        return;
      } else if (date.getFullYear() !== new Date().getFullYear()) {
        if (!confirm("O ano na data de assinatura é diferente do ano atual, informado pelo seu navegador.")) {
          itsAllOk = false;
          return;
        }
      } else if (date.getMonth() !== new Date().getMonth()) {
        if (!confirm("O mês na data de assinatura é diferente do mês atual, informado pelo seu navegador.")) {
          itsAllOk = false;
          return;
        }
      }
    }
    
    if (city && city[1] && signDate && signDate[1]) {
      const date = new Date(`${signDate[1]}T00:00:00-03:00`);
      formData.push(["dateFull", `${city[1]}, ${zeroLeft(2, date.getDate())} de ${date.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric"
      })}`]);
    } else {
      alert("Faltou preencher a cidade ou a data de assinatura!");
      itsAllOk = false;
      return;
    }
    
    const cpf = formData.find(f => f[0] === "cpf");
    if (cpf && cpf[1]) {
      if (!verifyCPF(cpf[1])) {
        alert("O CPF está inválido!");
        itsAllOk = false;
        return;
      }
    }
    
    if (itsAllOk) {
      formData.forEach((field) => {
        const referEl = $(`[data-refer="${field[0]}"]`);
        if (referEl.length) {
          if (field[0] === "signDate") {
            const date = new Date(field[1]);
            referEl.text(`${zeroLeft(2, date.getDate())} de ${date.toLocaleString("pt-BR", {month: "long"})} de ${date.getFullYear()}`);
          } else {
            referEl.text(field[1]);
          }
        }
      });
      
      const modal = document.querySelector("#modal-editar-informacoes");
      modal.close();
      
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }
  
  function attributeActions() {
    $('[data-action]').each(function() {
      const $action = $(this);
      const action = $action.attr('data-action');
      
      switch (action) {
        case 'edit':
          $action.on('click', (event) => {
            event.preventDefault();
            showModalEditInfos();
          });
          break;
        
        case 'closeModal':
          $action.on('click', (event) => {
            event.preventDefault();
            const dialog = this.closest('dialog');
            if (dialog) dialog.close();
          });
          break;
        
        case 'editForm':
          $action.on('submit', (event) => {
            event.preventDefault();
            send(event.target);
          });
          break;
        
        case 'updateSignDate':
          $action.on("click", () => {
            const now = new Date();
            const dateValue = `${now.getFullYear()}-${zeroLeft(2, now.getMonth() + 1)}-${zeroLeft(2, now.getDate())}`;
            $("#signDate").val(dateValue);
            const dateCheck = new Date($("#signDate").val());
            if (isNaN(dateCheck.getTime())) {
              $("#signDate").val("");
              alert("Não foi possível atualizar a data de assinatura para a data atual. Atualize manualmente.");
            }
          });
          break;
        
        default:
          console.warn('Ação não implementada:', action);
          break;
      }
    });
  }
  
  function attributeMask(param, input) {
    if (isEmpty(param) && isEmpty(input)) {
      $('[data-mask]').each(function() {
        const $input = $(this);
        const maskType = $input.attr('data-mask').trim().toLowerCase();
        
        switch (maskType) {
          case 'cpf':
            $input.mask('000.000.000-00');
            $input.on('input', function() {
              const $icon = $(this).closest('.area-validation-CPF').find('.icon-invalid-CPF');
              if (verifyCPF(this.value)) {
                $icon.fadeOut(500);
              } else {
                $icon.fadeIn(500);
              }
            });
            break;
          
          case 'cnpj':
            $input.mask('00.000.000/0000-00');
            if (!$input.val()) {
              $input.val('20.222.637/0001-30');
            }
            break;
          
          default:
            console.warn('Máscara não implementada:', maskType);
        }
      });
    } else {
      switch (param.toLowerCase().trim()) {
        case 'cpf':
          $(input).mask('000.000.000-00', {reverse: true});
          break;
        
        default:
          break;
      }
    }
  }
  
  const verifyValuesInParams = () => {
    try {
      const url = new URLSearchParams(window.location.search);
      if (url.size === 0) return;
      
      $('[data-input]').each(function() {
        const $input = $(this);
        const inputName = $input.attr('data-input');
        const paramValue = url.get(inputName);
        
        if (paramValue && !isEmpty(paramValue)) {
          const inputType = $input.attr('type') || 'text';
          
          switch (inputType) {
            case 'text':
              if (inputName === 'cpf') {
                const cleanValue = paramValue.replace(/\D/g, '').substring(0, 11);
                $input.val(cleanValue);
                attributeMask('cpf', this);
                const $icon = $input.closest('.area-validation-CPF').find('.icon-invalid-CPF');
                if (verifyCPF(cleanValue)) {
                  $icon.fadeOut(500);
                } else {
                  $icon.fadeIn(500);
                }
              } else {
                $input.val(paramValue.replaceAll('-', ' '));
              }
              break;
            case 'date':
              $input.val(paramValue);
              break;
          }
        }
      });
      
      const $form = $("form[data-action='editForm']");
      if ($form.length) {
        send($form[0]);
        setTimeout(() => {
          $('.btn-impressao').click();
        }, 500);
      }
    } catch (error) {
      console.log('Ocorreu um erro ao tentar recuperar os dados da URL. Erro: %s', error);
    }
  }
  
  const beforePrint = () => {
    $('#controle').hide();
  };
  
  const afterPrint = () => {
    $('#controle').show();
  };
  
  $(window).on('load', () => {
    $('.overlay').hide();
    attributeActions();
    attributeMask();
    verifyValuesInParams();
    
    $('input').attr('autocomplete', 'off');
    
    $('input[type=checkbox], input[type=radio]').on('focus', function() {
      $(this).closest('.form-group').addClass('focus');
    }).on('blur', function() {
      $(this).closest('.form-group').removeClass('focus');
    });
    
    try {
      const now = new Date();
      $('#signDate').val(`${now.getFullYear()}-${zeroLeft(2, now.getMonth() + 1)}-${zeroLeft(2, now.getDate())}`);
    } catch (error) {
      console.log('Erro ao definir data padrão. Erro: %s', error);
    }
    
    $('.btn-impressao').on('click', (event) => {
      event.preventDefault();
      window.print();
    });
  });
  
  if (window.matchMedia) {
    const mediaQueryList = window.matchMedia('print');
    
    mediaQueryList.addEventListener('change', (event) => {
      if (event.matches) {
        beforePrint();
      } else {
        afterPrint();
      }
    });
  }
  
  window.onbeforeprint = beforePrint;
  window.onafterprint = afterPrint;
  
  // Ativar modal editar informações com tecla Insert
  $(document).on('keyup', (event) => {
    if (event.keyCode === 45) {
      showModalEditInfos();
    }
  });
})();
