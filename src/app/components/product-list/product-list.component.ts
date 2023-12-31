import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  
  products: Product[] = [];
  currentCategoryId: number = 1;
  previousCategoryId: number = 1;
  searchMode: boolean = false;

  // new properties for pagination
  thePageNumber: number = 1;
  thePageSize: number = 10;
  theTotalElements: number = 0;

  previousKeyword: string = "";

  constructor(private productService: ProductService,
              private cartService: CartService,
              private route: ActivatedRoute) {}
  
  // hook function, similar as window.onload
  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  listProducts() {
    
    // 'keyword': path: 'search/:keyword'
    this.searchMode = this.route.snapshot.paramMap.has('keyword');

    if (this.searchMode) {
      this.handleSearchProducts();
    } else {
      this.handleListProducts();
    }

  }

  handleSearchProducts() {
    
    const theKeyword: string = this.route.snapshot.paramMap.get('keyword')!;

    // if we have a different keyword than previous, then set thePageNumber to 1
    if (this.previousKeyword != theKeyword) {
      this.thePageNumber = 1;
    }

    this.previousKeyword = theKeyword;

    console.log(`keyword=${theKeyword}, thePageNumber=${this.thePageNumber}`);
    
    // now search for the products using keyword
    this.productService.searchProductsPaginate(this.thePageNumber-1, 
                                              this.thePageSize,
                                              theKeyword).subscribe(this.processResult());

  }

  handleListProducts() {
    
    /**
     * check if "id" parameter is available
     * 
     * this.route.snapshot.paramMap.has()
     * route: use the activated route
     * snapshot: state of route at this given moment in time
     * paramMap: map of all the route parameters
     * has(): read the given "id" parameter
     */
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      /**
       * get the "id" param string. convert string to a number using the "+" symbol
       * get('id')!;
       * !: this is the non-null assertion operator. 
       * Tells compiler that object is not null.
       */
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
    } else {
      // if category id not available ... default to category id: 1
      this.currentCategoryId = 1;
    }

    /**
     * Check if we have a different category than previous
     * Note: Angular will reuse a component if it is currently being viewed
     * 
     * If we have a different category id than previous
     * then reset thePageNumber back to 1
     */
    if (this.previousCategoryId != this.currentCategoryId) {
      this.thePageNumber = 1;
    }

    this.previousCategoryId = this.currentCategoryId;

    console.log(`currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`);

    /**
     * now get the products for the given category id
     * 
     * Pagination component: pages are 1 based
     * Spring Data REST: pages are 0 based
     */
    this.productService.getProductListPaginate(this.thePageNumber-1,
                                              this.thePageSize, 
                                              this.currentCategoryId)
                                              .subscribe(this.processResult());

  }

  updatePageSize(pageSize: string) {
    this.thePageSize = +pageSize;
    this.thePageNumber = 1;
    // refresh the page view based on the given page size and number
    this.listProducts();
  }

  processResult() {
    return (data: any) => {
      this.products = data._embedded.products; // assign results to the Product array
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    };
  }

  addToCart(theProduct: Product) {
    console.log(`Adding to cart: ${theProduct.name}, ${theProduct.unitPrice}`);
    
    // TODO ..
    const theCartItem = new CartItem(theProduct);
    this.cartService.addToCart(theCartItem);
    
  }

}
