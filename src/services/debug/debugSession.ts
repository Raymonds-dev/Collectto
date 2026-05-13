import { UserResponse } from '@/types/auth';
import { CollectionResponse } from '@/types/collections';
import { ItemResponse } from '@/types/items';
import { SEED_COLLECTIONS, SEED_ITEMS, SEED_PROFILE } from '@/mocks/debug-seed';

class DebugSession {
  public currentUser: UserResponse | null = null;
  public collections: CollectionResponse[] = [];
  public items: ItemResponse[] = [];
  public isInitialized = false;

  public initialize() {
    if (this.isInitialized) return;
    this.currentUser = { ...SEED_PROFILE };
    this.collections = [...SEED_COLLECTIONS] as CollectionResponse[];
    this.items = [...SEED_ITEMS] as ItemResponse[];
    this.isInitialized = true;
  }

  public clear() {
    this.currentUser = null;
    this.collections = [];
    this.items = [];
    this.isInitialized = false;
  }
}

export const debugSession = new DebugSession();
