import { AbbreviatedManifest } from "pacote"
export interface EntriesType {
  name: string
  tag: string
  package: string
  version: string
  oldVersion: string
  private?: boolean
  isPublish?: boolean
  manifest: AbbreviatedManifest
}
export interface Results {
  package?: string
  type?: string
  version?: string
  oldVersion?: string
  tag?: string
  access?: string
  dryRun?: boolean
}


export interface SelectNpmTokenType {
  token: string
  mail: string
}