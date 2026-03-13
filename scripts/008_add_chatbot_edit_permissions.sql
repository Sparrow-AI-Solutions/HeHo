-- Add edit permissions for chatbot table-level access controls
ALTER TABLE public.chatbots
ADD COLUMN IF NOT EXISTS data_table_1_edit BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS data_table_2_edit BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS data_table_3_edit BOOLEAN DEFAULT FALSE;
