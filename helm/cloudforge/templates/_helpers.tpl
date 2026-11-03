{{- define "cloudforge.namespace" -}}
{{- .Values.namespace | default .Release.Namespace -}}
{{- end -}}

{{- define "cloudforge.labels" -}}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/part-of: cloudforge
{{- end -}}
