$(document).on('click', '.hc-atc', function(e) {
  
  e.preventDefault();
  const hc_id = $(this).attr('data-id');
  const hc_qty = $(this).attr('data-qty');

  $.ajax({
    url: '/cart/add.js',
    data: 'quantity='+hc_qty+'&id='+hc_id,
    dataType: 'json',
    method: 'post',
    success: function(cart) {
      var cartBuildEvent = new Event('cart:build');
      document.dispatchEvent(cartBuildEvent);
    },
    error: function(message) {
      var response = eval('(' + message.responseText + ')');
      response = response.description;
      if(response.indexOf('All 0') != -1){
        response = 'The item is out of stock!';
      }
      alert(response);
    }
  });
});

/* HC - Button animation - 29 Jan '24 */
$(document).on('click', '.hc-atc', function() {
  var hcATC = $(this);
  $(this).addClass('hc-dot-acive');
  setTimeout(function(){
    hcATC.removeClass('hc-dot-acive');
  }, 800);
});

$(document).on('change', '.hc-select', function() {
  var hc_id = $(this).attr('data-product');
  var hc_value = $(this).val();
  var hc_price = $('option:selected', this).attr('data-price');
  $('.hc-atc[data-product="'+hc_id+'"]').attr('data-id', hc_value);
  if($(this).hasClass('hc-carousel-select')){
    console.log(hc_price);
    $('.grid-product__price[data-product="'+hc_id+'"]').html(hc_price);
  }
});
$(document).on('click', '.qtyplus',function(e){
  var hc_id = $(this).attr('data-product');
  var $input = $('.js-quantity-selector[data-product="'+hc_id+'"]');
  var newValue = parseInt($input.val()) + 1;
  $input.val(newValue).trigger('change');
  $('.hc-atc[data-product="'+hc_id+'"]').attr('data-qty',newValue);  // Only update the specific product's ATC button
  return false;
});

$(document).on('click', '.qtyminus',function(e){
  var hc_id = $(this).attr('data-product');
  var $input = $('.js-quantity-selector[data-product="'+hc_id+'"]');  
  if(parseInt($input.val()) > 1){
    var newValue = parseInt($input.val()) - 1;
    $input.val(newValue).trigger('change');
    $('.hc-atc[data-product="'+hc_id+'"]').attr('data-qty',newValue);  // Only update the specific product's ATC button
  }
  return false;
});

/* HC - Drawer issue fix - 30 Mar '24 */
/*
$(document).on('click', '.js-close-header-cart',function(e){
  $('.site-header__cart').toggleClass('is-active');
  return false;
});*/

/* Automatic note saving for cart note */
$(document).on('blur', '#CartNote', function(){
  var newNote = $(this).val();
  if (typeof theme.updateNote === 'function') {
    theme.updateNote(newNote);
  }
});

