# _helpers.tpl
{{/*
Expand the name of the chart.
*/}}
{{- define "my-ha-fusion.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "my-ha-fusion.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- template "my-ha-fusion.name" . }}
{{- printf "-%s" .Chart.AppVersion | trunc 63 | trimSuffix "-" -}}
{{- end }}
{{- end }}

{{/*
Create a service account with the given name.
*/}}
{{- define "my-ha-fusion.serviceAccount.name" -}}
{{- default "default" .Values.serviceAccount.name -}}
{{- end }}