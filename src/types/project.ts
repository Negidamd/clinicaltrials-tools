// ---------------------------------------------------------------------------
// Project & Calculation type definitions for ClinicalTrials.Tools
// ---------------------------------------------------------------------------

import type { CalculatorSlug, CalculatorInput, CalculatorOutput } from "./calculator";

// ---------------------------------------------------------------------------
// Calculation (a single saved run)
// ---------------------------------------------------------------------------

export interface Calculation {
  /** Internal unique identifier. */
  id: string;
  /** ID of the project this calculation belongs to. */
  projectId: string;
  /** ID of the user who ran the calculation. */
  userId: string;
  /** Which calculator was used. */
  calculatorSlug: CalculatorSlug;
  /** Human-readable label / title chosen by the user. */
  label: string;
  /** Optional user notes / comments. */
  notes: string | null;
  /** Snapshot of the inputs at the time of calculation. */
  inputs: CalculatorInput;
  /** Snapshot of the outputs returned by the engine. */
  outputs: CalculatorOutput;
  /** Calculator engine version that produced the result. */
  engineVersion: string;
  /** Whether this calculation has been starred / pinned. */
  starred: boolean;
  /** ISO date of creation. */
  createdAt: Date;
  /** ISO date of last update. */
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Project (groups related calculations)
// ---------------------------------------------------------------------------

export interface Project {
  /** Internal unique identifier. */
  id: string;
  /** ID of the owning user. */
  userId: string;
  /** ID of the owning team (null for personal projects). */
  teamId: string | null;
  /** Project name. */
  name: string;
  /** Optional description. */
  description: string | null;
  /** Protocol identifier / study short title. */
  protocolId: string | null;
  /** Therapeutic area tag. */
  therapeuticArea: string | null;
  /** Phase of the trial (e.g., "Phase 3"). */
  phase: string | null;
  /** Indication / disease. */
  indication: string | null;
  /** Sponsor / organisation. */
  sponsor: string | null;
  /** List of calculations within this project. */
  calculations: Calculation[];
  /** Number of calculations (for list views without loading full calcs). */
  calculationCount: number;
  /** Whether the project is archived. */
  archived: boolean;
  /** ISO date of creation. */
  createdAt: Date;
  /** ISO date of last update. */
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Project list item (lightweight, for sidebar / dashboard)
// ---------------------------------------------------------------------------

export interface ProjectListItem {
  id: string;
  name: string;
  description: string | null;
  calculationCount: number;
  archived: boolean;
  updatedAt: Date;
}
