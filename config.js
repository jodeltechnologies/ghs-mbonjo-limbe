// The only file the school edits after the first upload.
//
// Both values below are safe to publish. The anon key is designed to be seen by
// every visitor, and what it may reach is decided by the row level security
// policies in supabase/02-policies.sql, not by keeping the key secret.
//
// Find them in Supabase under Settings, then API.
// Leave them empty and the page still works, on this one computer only.

window.GHS_CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: ''
};
