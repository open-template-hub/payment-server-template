import { PostgreSqlProvider, QueryFilters } from '@open-template-hub/common';

export interface ReceiptParams {
  postgresql_provider: PostgreSqlProvider;
  username: string;
  payment_config_key: string;
  is_subscription: boolean;
  start_date?: string;
  end_date?: string;
  product_id?: string;
  status?: string;
  filters?: QueryFilters;
}
