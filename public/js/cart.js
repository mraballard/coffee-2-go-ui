(function(){

  angular.module('coffee')
  .factory('$cart', Cart);

  function Cart($http){
    var cart = {};
    cart.total;
    cart.emptyCart = function(){
      cart.items = [];
    }
    cart.add = function(item, quantity, store) {
      console.log("cart add store:");
      console.log(store);
      console.log("currentStore");
      console.log(cart.currentStore);
      if (!cart.currentStore || cart.currentStore === store){
        cart.currentStore = store;
        console.log(cart.currentStore);
        cart.error = null;
        var indexOfProductInCart = -1;
        if (cart.items.length > 0) { // if cart is not empty, check to see if product is already in cart
          indexOfProductInCart = cart.items.findIndex(function(el) {
            return el.product.id === item.id;
          });
        }
        if (indexOfProductInCart === -1) {
            cart.items.push({product: item, quantity: Number(quantity), subtotal: (item.price * quantity)})
        } else {
          cart.items[indexOfProductInCart].quantity += Number(quantity);
          cart.items[indexOfProductInCart].subtotal = (item.price * cart.items[indexOfProductInCart].quantity);
        }
        cart.calculateTotal();
      } else {
        cart.error = "Adding items from different store. Empty cart or add from same store."
        console.log(cart.error);
      }
    }

    cart.update = function(item, quantity) {
      indexOfProductInCart = cart.items.findIndex(function(el) {
            return el.product.id === item.product.id;
          });
          console.log(cart.items[indexOfProductInCart]);
          cart.items[indexOfProductInCart].quantity = Number(quantity);
          cart.items[indexOfProductInCart].subtotal = (item.product.price * cart.items[indexOfProductInCart].quantity);
      cart.calculateTotal();
    }
    cart.remove = function(item) {
      indexOfProductInCart = cart.items.findIndex(function(el) {
            return el.product.id === item.product.id;
          });
          cart.items.splice(indexOfProductInCart, 1);
      cart.calculateTotal();
    }

    cart.calculateTotal = function() {
      cart.total = 0;
      cart.items.forEach(function(el){
        cart.total += el.subtotal;
      })
      console.log("new total");
      console.log(cart.total);
    }

    cart.emptyCart();
    return cart;
  }
})()
