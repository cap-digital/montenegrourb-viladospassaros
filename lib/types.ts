// Raw row shape returned by the Supabase edge function (Meta Ads insights).
// Empty numeric fields come back as "" — always coerce with num().
export interface MetaRow {
  date: string;
  campaign: string;
  adset_name: string;
  ad_name: string;
  thumbnail_url: string;
  instagram_permalink_url?: string;
  age: string;
  gender: string;
  spend: number | string;
  clicks: number | string;
  actions_link_click: number | string;
  impressions: number | string;
  reach: number | string;
  actions_post_engagement: number | string;
  video_thruplay_watched_actions_video_view: number | string;
  actions_video_view: number | string;
  video_p25_watched_actions_video_view: number | string;
  video_p50_watched_actions_video_view: number | string;
  video_p75_watched_actions_video_view: number | string;
  video_p100_watched_actions_video_view: number | string;
  actions_lead: number | string;
  actions_offsite_conversion_fb_pixel_lead: number | string;
  actions_onsite_conversion_lead_grouped: number | string;
  actions_onsite_conversion_messaging_conversation_started_7d: number | string;
  actions_comment: number | string;
  actions_onsite_conversion_post_save: number | string;
  actions_post_reaction: number | string;
}

// Google rows share the same analytical shape once the campaign is live.
export type GoogleRow = Partial<MetaRow> & Record<string, unknown>;

export interface ApiResponse {
  success: boolean;
  meta: MetaRow[];
  google: GoogleRow[];
  timestamp: string;
}
