(function(){

  angular.module('coffee')
  .factory('$cart', Cart);

  function Cart(){
    var cart = {};
    cart.emptyCart = function(){
      cart.items = [];
      console.log('$cart.items should be empty:');
      console.log(cart.items);
    }
    cart.add = function(item, quantity) {
        var indexOfProductInCart = -1;
        if (cart.items.length > 0) { // if cart is not empty, check to see if product is already in cart
          indexOfProductInCart = cart.items.findIndex(function(el) {
            return el.product._id === item.id;
          });
        }
        if (indexOfProductInCart === -1) {
            console.log('adding to cart');
            cart.items.push({product: item, quantity: Number(quantity)})
            console.log(cart.items);
            console.log('cart length: '+cart.items.length);
        } else {
          cart.items[indexOfProductInCart].quantity += Number(quantity);
        }
    }

    cart.update = function(item, quantity) {
      indexOfProductInCart = cart.items.findIndex(function(el) {
            return el.product._id === item.id;
          });
          cart.items[indexOfProductInCart].quantity = Number(quantity);
    }
    cart.remove = function(item) {
      indexOfProductInCart = cart.items.findIndex(function(el) {
            return el.product._id === item.id;
          });
          cart.items.splice(indexOfProductInCart, 1);
    }

    cart.emptyCart();
    return cart;
  }
})()
