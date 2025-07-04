export interface Prediction {
  [key: string]: string | number | undefined;
  tweet_id: string;
  sentiment: number | string;
  verified?: string;
  username?: string;
  date?: string;
  retweets?: string;
  tweet?: string;
  sentiment_confidence?: string;
  request?: string;
  request_confidence?: string;
  offer?: string;
  offer_confidence?: string;
  aid_related?: string;
  aid_related_confidence?: string;
  medical_help?: string;
  medical_help_confidence?: string;
  medical_products?: string;
  medical_products_confidence?: string;
  search_and_rescue?: string;
  search_and_rescue_confidence?: string;
  security?: string;
  military?: string;
  child_alone?: string;
  water?: string;
  food?: string;
  shelter?: string;
  clothing?: string;
  money?: string;
  missing_people?: string;
  refugees?: string;
  death?: string;
  other_aid?: string;
  infrastructure_related?: string;
  transport?: string;
  buildings?: string;
  electricity?: string;
  tools?: string;
  hospitals?: string;
  shops?: string;
  aid_centers?: string;
  other_infrastructure?: string;
  weather_related?: string;
  floods?: string;
  storm?: string;
  fire?: string;
  earthquake?: string;
  cold?: string;
  other_weather?: string;
  direct_report?: string;
  genre?: string;
  related?: string;
} 