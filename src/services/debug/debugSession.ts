import { UserResponse } from '@/types/auth';
import { CollectionResponse } from '@/types/collections';
import { ItemResponse } from '@/types/items';
import { NotificationSummary } from '@/types/notifications';
import {
  SEED_COLLECTIONS,
  SEED_ITEMS,
  SEED_NOTIFICATIONS,
  SEED_OTHER_COLLECTIONS,
  SEED_OTHER_ITEMS,
  SEED_OTHER_PROFILE,
  SEED_PROFILE,
} from '@/mocks/debug-seed';

class DebugSession {
  public currentUser: UserResponse | null = null;
  public users: UserResponse[] = [];
  public collections: CollectionResponse[] = [];
  public items: ItemResponse[] = [];
  public notifications: NotificationSummary[] = [];
  public follows: string[] = []; // List of user IDs that currentUser follows
  public isInitialized = false;

  public initialize() {
    if (this.isInitialized) return;
    this.currentUser = { ...SEED_PROFILE };
    this.users = [{ ...SEED_PROFILE }, { ...SEED_OTHER_PROFILE }] as UserResponse[];
    this.collections = [...SEED_COLLECTIONS, ...SEED_OTHER_COLLECTIONS] as CollectionResponse[];
    this.items = [...SEED_ITEMS, ...SEED_OTHER_ITEMS] as ItemResponse[];
    this.notifications = [...SEED_NOTIFICATIONS] as NotificationSummary[];
    this.follows = []; // Start with no follows initially
    this.isInitialized = true;
  }

  public clear() {
    this.currentUser = null;
    this.users = [];
    this.collections = [];
    this.items = [];
    this.notifications = [];
    this.follows = [];
    this.isInitialized = false;
  }
}

export const debugSession = new DebugSession();
