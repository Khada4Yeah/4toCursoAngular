import { Component, EventEmitter, Input, Output } from '@angular/core';

import { CreateProductDTO, Product } from '../../models/product.model';

import { StoreService } from '../../services/store.service';
import { ProductsService } from 'src/app/services/products.service';
import { switchMap, zip } from 'rxjs';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent {
  @Input() products: Product[] = [];
  @Output() loadMore = new EventEmitter();

  total = 0;
  myShoppingCart: Product[] = [];
  showProductDetail = false;
  productChosen: Product | null = null;
  statusDetail: 'loading' | 'error' | 'success' | 'init' = 'init';

  constructor(
    private storeService: StoreService,
    private productsService: ProductsService
  ) {
    this.myShoppingCart = this.storeService.getShoppingCart();
  }

  onAddToShoppingCart(product: Product): void {
    this.storeService.addProduct(product);
    this.total = this.storeService.getTotal();
  }

  toggleProductDetail(): void {
    this.showProductDetail = !this.showProductDetail;
  }

  onShowDetail(id: string): void {
    this.statusDetail = 'loading';
    this.toggleProductDetail();
    this.productsService.getOne(id).subscribe(
      (data) => {
        this.productChosen = data;
        this.statusDetail = 'success';
      },
      (errorMsg) => {
        window.alert(errorMsg);
        this.statusDetail = 'error';
      }
    );
  }

  readAndUpdate(id: string): void {
    // swithMap si depende una de otra
    // zip para correr en paralelo
    // colocar directo en el servicio
    this.productsService
      .getOne(id)
      .pipe(
        switchMap((product) =>
          this.productsService.update(product.id, { title: 'change' })
        )
      )
      .subscribe((data) => {
        console.log(data);
      });

    this.productsService
      .fetchReadAndUpdate(id, { title: 'change' })
      .subscribe((response) => {
        const product = response[0];
        const update = response[1];
      });

    // zip(
    //   this.productsService.getProduct(id),
    //   this.productsService.update(id, { title: 'nuevo' })
    // ).subscribe((response) => {
    //   const product = response[0];
    //   const update = response[1];
    // });
  }

  createNewProduct(): void {
    const product: CreateProductDTO = {
      title: 'Nuevo producto',
      description: 'Descripción del producto',
      price: 1000,
      images: [`https://placeimg.com/640/480/any?random=${Math.random()}`],
      categoryId: 2,
    };
    this.productsService.create(product).subscribe((data) => {
      console.log('', data);
      this.products.unshift(data);
    });
  }

  updateProduct(): void {
    if (this.productChosen) {
      const changes = {
        title: 'Nuevo titulo',
      };
      const id = this.productChosen?.id;
      this.productsService.update(id, changes).subscribe((data) => {
        const productIndex = this.products.findIndex((item) => item.id === id);
        this.products[productIndex] = data;
        this.productChosen = data;
      });
    }
  }

  deleteProduct(): void {
    if (this.productChosen) {
      const id = this.productChosen?.id;
      this.productsService.delete(id).subscribe(() => {
        const productIndex = this.products.findIndex((item) => item.id === id);
        this.products.splice(productIndex, 1);
        this.showProductDetail = false;
      });
    }
  }

  onLoadMore(): void {
    this.loadMore.emit();
  }
}
