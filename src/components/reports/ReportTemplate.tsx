// ---------------------------------------------------------------------------
// PDF Report Template for ClinicalTrials.Tools
// Uses @react-pdf/renderer to produce a professional clinical trial report.
// ---------------------------------------------------------------------------

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// ---------------------------------------------------------------------------
// Report data interface
// ---------------------------------------------------------------------------

export interface ReportData {
  studyTitle: string;
  calculatorName: string;
  calculatorVersion: string;
  date: string;
  inputs: Record<string, string | number>;
  results: {
    sampleSizeTotal: number;
    sampleSizePerGroup: number[];
    achievedPower: number;
    effectSize: number;
    method: string;
  };
  assumptions: string[];
  formula: string;
  references: string[];
  sensitivityData?: { paramValue: number; n: number; power: number }[];
  isFreeUser: boolean;
}

// ---------------------------------------------------------------------------
// Brand colours & design tokens
// ---------------------------------------------------------------------------

const BRAND_TEAL = "#0D7377";
const BRAND_TEAL_LIGHT = "#E6F3F3";
const TEXT_PRIMARY = "#1A1A2E";
const TEXT_SECONDARY = "#4A4A6A";
const TEXT_MUTED = "#7A7A9A";
const BORDER_COLOR = "#D1D5DB";
const ROW_STRIPE = "#F9FAFB";
const WHITE = "#FFFFFF";

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // Page & global
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 60,
    paddingBottom: 70,
    paddingHorizontal: 50,
    color: TEXT_PRIMARY,
  },

  // Watermark (free tier)
  watermark: {
    position: "absolute",
    top: "45%",
    left: "10%",
    fontSize: 38,
    color: "#0D737722",
    transform: "rotate(-35deg)",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
  },

  // ---------------------------------------------------------------------------
  // Header
  // ---------------------------------------------------------------------------
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 2,
    borderBottomColor: BRAND_TEAL,
    paddingBottom: 12,
    marginBottom: 24,
  },
  headerBrand: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: BRAND_TEAL,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 9,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerDate: {
    fontSize: 9,
    color: TEXT_SECONDARY,
  },
  headerBadge: {
    marginTop: 4,
    backgroundColor: BRAND_TEAL,
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  headerBadgeText: {
    fontSize: 8,
    color: WHITE,
    fontFamily: "Helvetica-Bold",
  },

  // ---------------------------------------------------------------------------
  // Study title
  // ---------------------------------------------------------------------------
  studyTitleSection: {
    marginBottom: 20,
  },
  studyTitleLabel: {
    fontSize: 9,
    color: TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  studyTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: TEXT_PRIMARY,
    lineHeight: 1.3,
  },

  // ---------------------------------------------------------------------------
  // Calculator info row
  // ---------------------------------------------------------------------------
  calculatorInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: BRAND_TEAL_LIGHT,
    borderRadius: 4,
    padding: 10,
    marginBottom: 20,
  },
  calculatorInfoItem: {
    flexDirection: "column",
  },
  calculatorInfoLabel: {
    fontSize: 8,
    color: TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  calculatorInfoValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: TEXT_PRIMARY,
  },

  // ---------------------------------------------------------------------------
  // Section headings
  // ---------------------------------------------------------------------------
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: BRAND_TEAL,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    paddingBottom: 4,
    marginBottom: 10,
    marginTop: 18,
  },

  // ---------------------------------------------------------------------------
  // Results summary
  // ---------------------------------------------------------------------------
  resultsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  resultCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 4,
    padding: 10,
    alignItems: "center",
  },
  resultCardPrimary: {
    flex: 1,
    borderWidth: 2,
    borderColor: BRAND_TEAL,
    borderRadius: 4,
    padding: 12,
    alignItems: "center",
    backgroundColor: BRAND_TEAL_LIGHT,
  },
  resultLabel: {
    fontSize: 8,
    color: TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  resultValuePrimary: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: BRAND_TEAL,
  },
  resultValue: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: TEXT_PRIMARY,
  },
  resultUnit: {
    fontSize: 8,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  methodRow: {
    marginTop: 8,
    padding: 8,
    backgroundColor: ROW_STRIPE,
    borderRadius: 3,
  },
  methodLabel: {
    fontSize: 8,
    color: TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  methodValue: {
    fontSize: 10,
    color: TEXT_PRIMARY,
  },

  // ---------------------------------------------------------------------------
  // Tables (inputs & sensitivity)
  // ---------------------------------------------------------------------------
  table: {
    marginBottom: 12,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: BRAND_TEAL,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_COLOR,
  },
  tableRowStriped: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_COLOR,
    backgroundColor: ROW_STRIPE,
  },
  tableCellKey: {
    width: "50%",
    fontSize: 9,
    color: TEXT_SECONDARY,
  },
  tableCellValue: {
    width: "50%",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: TEXT_PRIMARY,
  },
  // Sensitivity-specific (3 columns)
  senColParam: {
    width: "34%",
    fontSize: 9,
  },
  senColN: {
    width: "33%",
    fontSize: 9,
  },
  senColPower: {
    width: "33%",
    fontSize: 9,
  },

  // ---------------------------------------------------------------------------
  // Assumptions list
  // ---------------------------------------------------------------------------
  listItem: {
    flexDirection: "row",
    marginBottom: 4,
    paddingLeft: 4,
  },
  listBullet: {
    width: 12,
    fontSize: 10,
    color: BRAND_TEAL,
  },
  listText: {
    flex: 1,
    fontSize: 9,
    color: TEXT_SECONDARY,
    lineHeight: 1.4,
  },

  // ---------------------------------------------------------------------------
  // Formula
  // ---------------------------------------------------------------------------
  formulaBox: {
    backgroundColor: ROW_STRIPE,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
  },
  formulaText: {
    fontSize: 9,
    fontFamily: "Courier",
    color: TEXT_PRIMARY,
    lineHeight: 1.5,
  },

  // ---------------------------------------------------------------------------
  // References
  // ---------------------------------------------------------------------------
  referenceItem: {
    flexDirection: "row",
    marginBottom: 4,
    paddingLeft: 4,
  },
  referenceNumber: {
    width: 18,
    fontSize: 9,
    color: BRAND_TEAL,
    fontFamily: "Helvetica-Bold",
  },
  referenceText: {
    flex: 1,
    fontSize: 8,
    color: TEXT_SECONDARY,
    lineHeight: 1.4,
  },

  // ---------------------------------------------------------------------------
  // Footer
  // ---------------------------------------------------------------------------
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 7,
    color: TEXT_MUTED,
  },
  footerPageNumber: {
    fontSize: 7,
    color: TEXT_MUTED,
  },
});

// ---------------------------------------------------------------------------
// Helper: format a key string to a readable label
// ---------------------------------------------------------------------------

function formatLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReportTemplate({ data }: { data: ReportData }) {
  const inputEntries = Object.entries(data.inputs);
  const perGroupLabel =
    data.results.sampleSizePerGroup.length > 1
      ? data.results.sampleSizePerGroup.join(" / ")
      : String(data.results.sampleSizePerGroup[0] ?? "N/A");

  return (
    <Document
      title={`${data.studyTitle} - Sample Size Report`}
      author="ClinicalTrials.Tools"
      subject="Sample Size Calculation Report"
      creator="ClinicalTrials.Tools v1.0"
    >
      <Page size="A4" style={styles.page}>
        {/* Free-tier watermark */}
        {data.isFreeUser && (
          <Text style={styles.watermark} fixed>
            Generated with ClinicalTrials.Tools {"\u2014"} Free Version
          </Text>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Header                                                            */}
        {/* ----------------------------------------------------------------- */}
        <View style={styles.header} fixed>
          <View>
            <Text style={styles.headerBrand}>ClinicalTrials.Tools</Text>
            <Text style={styles.headerSubtitle}>
              Sample Size Calculation Report
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerDate}>Report Date: {data.date}</Text>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>
                {data.isFreeUser ? "FREE" : "PRO"}
              </Text>
            </View>
          </View>
        </View>

        {/* ----------------------------------------------------------------- */}
        {/* Study Title                                                       */}
        {/* ----------------------------------------------------------------- */}
        <View style={styles.studyTitleSection}>
          <Text style={styles.studyTitleLabel}>Study Title</Text>
          <Text style={styles.studyTitle}>{data.studyTitle}</Text>
        </View>

        {/* ----------------------------------------------------------------- */}
        {/* Calculator Type & Version                                         */}
        {/* ----------------------------------------------------------------- */}
        <View style={styles.calculatorInfoRow}>
          <View style={styles.calculatorInfoItem}>
            <Text style={styles.calculatorInfoLabel}>Calculator</Text>
            <Text style={styles.calculatorInfoValue}>
              {data.calculatorName}
            </Text>
          </View>
          <View style={styles.calculatorInfoItem}>
            <Text style={styles.calculatorInfoLabel}>Engine Version</Text>
            <Text style={styles.calculatorInfoValue}>
              {data.calculatorVersion}
            </Text>
          </View>
          <View style={styles.calculatorInfoItem}>
            <Text style={styles.calculatorInfoLabel}>Method</Text>
            <Text style={styles.calculatorInfoValue}>
              {data.results.method}
            </Text>
          </View>
        </View>

        {/* ----------------------------------------------------------------- */}
        {/* Results Summary                                                   */}
        {/* ----------------------------------------------------------------- */}
        <Text style={styles.sectionTitle}>Results Summary</Text>

        <View style={styles.resultsContainer}>
          <View style={styles.resultCardPrimary}>
            <Text style={styles.resultLabel}>Total Sample Size</Text>
            <Text style={styles.resultValuePrimary}>
              {data.results.sampleSizeTotal}
            </Text>
            <Text style={styles.resultUnit}>participants</Text>
          </View>
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Per Group</Text>
            <Text style={styles.resultValue}>{perGroupLabel}</Text>
            <Text style={styles.resultUnit}>per arm</Text>
          </View>
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Achieved Power</Text>
            <Text style={styles.resultValue}>
              {(data.results.achievedPower * 100).toFixed(1)}%
            </Text>
            <Text style={styles.resultUnit}>
              1 - {"\u03B2"}
            </Text>
          </View>
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Effect Size</Text>
            <Text style={styles.resultValue}>
              {data.results.effectSize.toFixed(3)}
            </Text>
            <Text style={styles.resultUnit}>standardised</Text>
          </View>
        </View>

        <View style={styles.methodRow}>
          <Text style={styles.methodLabel}>Statistical Method</Text>
          <Text style={styles.methodValue}>{data.results.method}</Text>
        </View>

        {/* ----------------------------------------------------------------- */}
        {/* Input Parameters                                                  */}
        {/* ----------------------------------------------------------------- */}
        <Text style={styles.sectionTitle}>Input Parameters</Text>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, { width: "50%" }]}>
              Parameter
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "50%" }]}>
              Value
            </Text>
          </View>
          {inputEntries.map(([key, value], index) => (
            <View
              key={key}
              style={index % 2 === 0 ? styles.tableRow : styles.tableRowStriped}
            >
              <Text style={styles.tableCellKey}>{formatLabel(key)}</Text>
              <Text style={styles.tableCellValue}>{String(value)}</Text>
            </View>
          ))}
        </View>

        {/* ----------------------------------------------------------------- */}
        {/* Sensitivity Analysis                                              */}
        {/* ----------------------------------------------------------------- */}
        {data.sensitivityData && data.sensitivityData.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Sensitivity Analysis</Text>
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, styles.senColParam]}>
                  Parameter Value
                </Text>
                <Text style={[styles.tableHeaderCell, styles.senColN]}>
                  Sample Size (N)
                </Text>
                <Text style={[styles.tableHeaderCell, styles.senColPower]}>
                  Power
                </Text>
              </View>
              {data.sensitivityData.map((row, index) => (
                <View
                  key={index}
                  style={
                    index % 2 === 0 ? styles.tableRow : styles.tableRowStriped
                  }
                >
                  <Text style={[styles.senColParam, { color: TEXT_SECONDARY }]}>
                    {row.paramValue.toFixed(3)}
                  </Text>
                  <Text
                    style={[
                      styles.senColN,
                      { fontFamily: "Helvetica-Bold", color: TEXT_PRIMARY },
                    ]}
                  >
                    {row.n}
                  </Text>
                  <Text style={[styles.senColPower, { color: TEXT_SECONDARY }]}>
                    {(row.power * 100).toFixed(1)}%
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Assumptions                                                       */}
        {/* ----------------------------------------------------------------- */}
        {data.assumptions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Assumptions</Text>
            {data.assumptions.map((assumption, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listBullet}>{"\u2022"}</Text>
                <Text style={styles.listText}>{assumption}</Text>
              </View>
            ))}
          </>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Formula                                                           */}
        {/* ----------------------------------------------------------------- */}
        {data.formula && (
          <>
            <Text style={styles.sectionTitle}>Formula</Text>
            <View style={styles.formulaBox}>
              <Text style={styles.formulaText}>{data.formula}</Text>
            </View>
          </>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* References                                                        */}
        {/* ----------------------------------------------------------------- */}
        {data.references.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>References</Text>
            {data.references.map((ref, index) => (
              <View key={index} style={styles.referenceItem}>
                <Text style={styles.referenceNumber}>[{index + 1}]</Text>
                <Text style={styles.referenceText}>{ref}</Text>
              </View>
            ))}
          </>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Footer                                                            */}
        {/* ----------------------------------------------------------------- */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generated by ClinicalTrials.Tools v1.0 on {data.date} |
            www.clinicaltrials.tools
          </Text>
          <Text
            style={styles.footerPageNumber}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
