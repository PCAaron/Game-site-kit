import {
  buildCatalogVerificationReport,
  getBallgamesCatalog,
  validateCatalog,
} from '../lib/catalog/index'

validateCatalog(getBallgamesCatalog())
const report = buildCatalogVerificationReport()
console.log(JSON.stringify(report, null, 2))

if (report.issues.length > 0) {
  console.error(
    'Catalog schema PASS. Production readiness remains BLOCKED / MANUAL REVIEW (see report).'
  )
}
