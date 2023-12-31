import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})

export class ProductDetailsComponent implements OnInit {
  
  product!: Product;
  
  constructor(private productService: ProductService,
              private cartService: CartService,
              private route: ActivatedRoute) {

  }
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.handleProductDetails();
    });
  }

  handleProductDetails() {
    
    // get the "id" param string. Convert string to a number using the "+"
    const theProductId: number = +this.route.snapshot.paramMap.get('id')!;
    console.log('1==>',theProductId);
    this.productService.getProduct(theProductId).subscribe(
      data => {
        this.product = data;
      }
    );

    console.log('2==>',this.product);
    
    
  }

  addToCart() {
    
    console.log(`Adding to cart: ${this.product.name}, ${this.product.unitPrice}`);
    const theCartItem = new CartItem(this.product);
    this.cartService.addToCart(theCartItem);

  }

}
