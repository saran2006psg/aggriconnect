import { Request, Response } from 'express';
import { createResponse, createPaginatedResponse } from '../utils/response';
import {
  listProductsService,
  getProductService,
  createProductService,
  updateProductService,
  deleteProductService,
} from '../services/product.service';

export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const { search, category, farmer, sortBy, page = '1', perPage = '20' } = req.query as Record<string, string>;
    const { products, total } = await listProductsService({
      search,
      category,
      farmer,
      sortBy: sortBy as 'recent' | 'price_asc' | 'price_desc' | 'rating',
      page: parseInt(page, 10),
      perPage: parseInt(perPage, 10),
    });
    res.json(createPaginatedResponse(products, parseInt(page, 10), parseInt(perPage, 10), total, 'Products retrieved successfully'));
  } catch (e) {
    res.json(createResponse(false, 'Failed to retrieve products', null, { server: String(e) }));
  }
}

export async function getProduct(req: Request, res: Response): Promise<void> {
  try {
    const product = await getProductService(req.params.product_id);
    if (!product) {
      res.json(createResponse(false, 'Product not found', null, { product: 'Product does not exist' }));
      return;
    }
    res.json(createResponse(true, 'Product retrieved successfully', product));
  } catch (e) {
    res.json(createResponse(false, 'Failed to retrieve product', null, { server: String(e) }));
  }
}

export async function createProduct(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user!;
    const data = await createProductService(req.body, user.id, user.farm_location);
    res.json(createResponse(true, 'Product created successfully', data));
  } catch (e) {
    res.json(createResponse(false, 'Failed to create product', null, { server: String(e) }));
  }
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  try {
    const result = await updateProductService(req.params.product_id, req.body, req.user!.id);
    if (!result.found) {
      res.json(createResponse(false, 'Product not found', null, { product: 'Product does not exist' }));
      return;
    }
    if (result.forbidden) {
      res.json(createResponse(false, 'Forbidden', null, { auth: 'You can only update your own products' }));
      return;
    }
    res.json(createResponse(true, 'Product updated successfully', result.data));
  } catch (e) {
    res.json(createResponse(false, 'Failed to update product', null, { server: String(e) }));
  }
}

export async function deleteProduct(req: Request, res: Response): Promise<void> {
  try {
    const result = await deleteProductService(req.params.product_id, req.user!.id);
    if (!result.found) {
      res.json(createResponse(false, 'Product not found', null, { product: 'Product does not exist' }));
      return;
    }
    if (result.forbidden) {
      res.json(createResponse(false, 'Forbidden', null, { auth: 'You can only delete your own products' }));
      return;
    }
    res.json(createResponse(true, 'Product deleted successfully'));
  } catch (e) {
    res.json(createResponse(false, 'Failed to delete product', null, { server: String(e) }));
  }
}
