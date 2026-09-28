#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para extraer texto de documentos Word (.docx)
Crysantem - Términos y Condiciones
"""

import sys
import os

def install_docx2txt():
    """Intenta importar diferentes librerías para procesar .docx"""
    libraries = ['docx2txt', 'docx', 'openpyxl']
    
    for lib in libraries:
        try:
            if lib == 'docx2txt':
                import docx2txt
                return 'docx2txt'
            elif lib == 'docx':
                from docx import Document
                return 'docx'
        except ImportError:
            continue
    
    print("Error: No se encontraron librerías para procesar .docx")
    print("Por favor, copia y pega el contenido del documento directamente en el chat")
    return None

def extract_text_from_docx(docx_path, library=None):
    """Extrae texto de un archivo .docx usando diferentes librerías"""
    try:
        if library == 'docx2txt':
            import docx2txt
            text = docx2txt.process(docx_path)
            return text
        elif library == 'docx':
            from docx import Document
            doc = Document(docx_path)
            text = '\n'.join([paragraph.text for paragraph in doc.paragraphs])
            return text
        else:
            # Intento genérico
            try:
                import docx2txt
                text = docx2txt.process(docx_path)
                return text
            except:
                try:
                    from docx import Document
                    doc = Document(docx_path)
                    text = '\n'.join([paragraph.text for paragraph in doc.paragraphs])
                    return text
                except Exception as e:
                    print(f"Error al procesar el documento: {e}")
                    return None
    except Exception as e:
        print(f"Error al procesar el documento: {e}")
        return None

def save_to_html(text, output_path):
    """Guarda el texto extraído en formato HTML para la web"""
    html_content = f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Términos y Condiciones - Crysantem</title>
</head>
<body>
    <div class="terms-content">
{text}
    </div>
</body>
</html>
"""
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"✅ HTML guardado en: {output_path}")

def save_to_markdown(text, output_path):
    """Guarda el texto extraído en formato Markdown"""
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f"✅ Markdown guardado en: {output_path}")

def main():
    # Configurar codificación UTF-8 para la consola
    if sys.platform == 'win32':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    # Ruta del documento Word
    docx_path = "Terminos y condiciones Crysantem.docx"
    
    # Verificar si el archivo existe
    if not os.path.exists(docx_path):
        print(f"Error: El archivo '{docx_path}' no existe en el directorio actual.")
        print(f"Directorio actual: {os.getcwd()}")
        return
    
    print(f"Procesando: {docx_path}")
    
    # Intentar usar librerías disponibles
    library = install_docx2txt()
    
    if not library:
        print("\nSUGERENCIA: Como no se pudieron instalar librerías, por favor:")
        print("1. Abre el archivo 'Terminos y condiciones Crysantem.docx'")
        print("2. Copia todo el contenido")
        print("3. Pégalo en el chat para que pueda actualizar los términos")
        return
    
    # Extraer texto
    text = extract_text_from_docx(docx_path, library)
    
    if text:
        print("Texto extraido exitosamente")
        print("\n" + "="*50)
        print("CONTENIDO EXTRAIDO:")
        print("="*50)
        print(text)
        print("="*50 + "\n")
        
        # Guardar en diferentes formatos
        output_html = "terminos_condiciones.html"
        output_md = "terminos_condiciones.md"
        
        save_to_html(text, output_html)
        save_to_markdown(text, output_md)
        
        print(f"\nArchivos generados:")
        print(f"   - {output_html} (formato HTML)")
        print(f"   - {output_md} (formato Markdown)")
        
    else:
        print("No se pudo extraer el texto del documento")

if __name__ == "__main__":
    main()