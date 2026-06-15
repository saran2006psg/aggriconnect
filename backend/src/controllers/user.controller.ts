import { Request, Response } from 'express';
import { createResponse } from '../utils/response';
import {
  updateProfileService,
  getAddressesService,
  createAddressService,
  updateAddressService,
  deleteAddressService,
} from '../services/user.service';

export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    const result = await updateProfileService(req.user!.id, req.body);
    res.json(createResponse(result.success, result.message, result.data ?? null, result.errors ?? null));
  } catch (e) {
    res.json(createResponse(false, 'Failed to update profile', null, { server: String(e) }));
  }
}

export async function getAddresses(req: Request, res: Response): Promise<void> {
  try {
    const data = await getAddressesService(req.user!.id);
    res.json(createResponse(true, 'Addresses retrieved successfully', data));
  } catch (e) {
    res.json(createResponse(false, 'Failed to retrieve addresses', null, { server: String(e) }));
  }
}

export async function createAddress(req: Request, res: Response): Promise<void> {
  try {
    const data = await createAddressService(req.user!.id, req.body);
    res.json(createResponse(true, 'Address added successfully', data));
  } catch (e) {
    res.json(createResponse(false, 'Failed to add address', null, { server: String(e) }));
  }
}

export async function updateAddress(req: Request, res: Response): Promise<void> {
  try {
    const result = await updateAddressService(req.params.address_id, req.user!.id, req.body);
    if (!result.found) {
      res.json(createResponse(false, 'Address not found', null, { address: 'Address does not exist' }));
      return;
    }
    res.json(createResponse(true, 'Address updated successfully', result.data));
  } catch (e) {
    res.json(createResponse(false, 'Failed to update address', null, { server: String(e) }));
  }
}

export async function deleteAddress(req: Request, res: Response): Promise<void> {
  try {
    const deleted = await deleteAddressService(req.params.address_id, req.user!.id);
    if (!deleted) {
      res.json(createResponse(false, 'Address not found', null, { address: 'Address does not exist' }));
      return;
    }
    res.json(createResponse(true, 'Address deleted successfully'));
  } catch (e) {
    res.json(createResponse(false, 'Failed to delete address', null, { server: String(e) }));
  }
}
