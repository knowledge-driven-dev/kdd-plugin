/**
 * KDD Project Configuration
 *
 * Customize this file for your project's directory structure and naming conventions.
 * Scripts in /scripts use these values to resolve code paths and generate scaffolds.
 *
 * After installation, update the values below to match your project layout.
 */
export default {
  /** Directory where use-case code files live (relative to project root) */
  useCasesDir: 'src/application/use-cases',

  /** Directory where UI components live (for story sync detection) */
  componentsDir: 'src/components/features',

  /**
   * Map PascalCase entity names from CMD specs to your codebase names.
   * Used by scaffold and code-mapping scripts.
   * Example: { 'Order': 'order', 'Customer': 'customer' }
   */
  entityNameMap: {
    // 'Order': 'order',
    // 'Customer': 'customer',
  } as Record<string, string>,

  /**
   * Map PascalCase action verbs from CMD specs to your codebase convention.
   * These are merged with built-in defaults (Create, Update, Delete, Get, List, etc.)
   * Only add verbs that differ from their lowercase version.
   * Example: { 'Start': 'iniciar', 'Execute': 'ejecutar' }
   */
  actionVerbMap: {
    // 'Start': 'begin',
    // 'Execute': 'run',
  } as Record<string, string>,

  /**
   * Map use-case filenames (without .use-case.ts) to CMD/QRY IDs.
   * Used as fallback when files don't contain CMD comments.
   * Example: { 'create-order': 'CMD-001', 'list-orders': 'QRY-001' }
   */
  codeMapping: {
    // 'create-order': 'CMD-001',
    // 'get-order': 'QRY-001',
  } as Record<string, string>,
}
