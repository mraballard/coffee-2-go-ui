(function(){

  angular.module('coffee')
  .factory('$cart', Cart);

  function Cart(){
    var cart = {};
    cart.total;
    cart.emptyCart = function(){
      cart.items = [];
      console.log('$cart.items should be empty:');
      console.log(cart.items);
    }
    cart.add = function(item, quantity) {
        var indexOfProductInCart = -1;
        if (cart.items.length > 0) { // if cart is not empty, check to see if product is already in cart
          indexOfProductInCart = cart.items.findIndex(function(el) {
            console.log(el);
            return el.product.id === item.id;
          });
        }
        if (indexOfProductInCart === -1) {
            console.log('adding to cart');
            cart.items.push({product: item, quantity: Number(quantity), subtotal: (item.price * quantity)})
        } else {
          cart.items[indexOfProductInCart].quantity += Number(quantity);
        }
    }

    cart.update = function(item, quantity) {
      indexOfProductInCart = cart.items.findIndex(function(el) {
            return el.product._id === item.id;
          });
          cart.items[indexOfProductInCart].quantity = Number(quantity);
          cart.items[indexOfProductInCart].subtotal = (item.price * Number(quantity));
    }
    cart.remove = function(item) {
      indexOfProductInCart = cart.items.findIndex(function(el) {
            return el.product._id === item.id;
          });
          cart.items.splice(indexOfProductInCart, 1);
    }

    cart.calculateTotal = function() {
      cart.total = 0;
      cart.items.forEach(function(el){
        cart.total += el.subtotal;
      })
    }

    cart.emptyCart();
    return cart;
  }
})()
