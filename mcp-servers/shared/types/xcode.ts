/**
 * Xcode tool types
 */

/**
 * Build operation parameters
 */
export interface BuildParams {
  project_path?: string;
  scheme: string;
  configuration?: "Debug" | "Release";
  destination?: string;
  sdk?: string;
  arch?: string;
  clean_before_build?: boolean;
  parallel?: boolean;
  quiet?: boolean;
}

/**
 * Build result data
 */
export interface BuildResultData {
  message: string;
  note?: string;
  duration?: string;
  errors?: string[];
  warnings?: number;
  cache_id?: string;
}
