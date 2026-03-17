let stagedImageFiles: File[] = [];

export function stageDiagnosisImageFiles(files: File[]) {
  stagedImageFiles = files.filter(Boolean);
}

export function getStagedDiagnosisImageFiles() {
  return stagedImageFiles;
}

export function clearStagedDiagnosisImageFiles() {
  stagedImageFiles = [];
}
