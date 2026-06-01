import subprocess
import tkinter as tk
from tkinter import filedialog, messagebox

def compress_pdf():
    input_file = filedialog.askopenfilename(filetypes=[("PDF files", "*.pdf")])
    if not input_file:
        return

    output_file = filedialog.asksaveasfilename(
        defaultextension=".pdf",
        filetypes=[("PDF files", "*.pdf")]
    )
    if not output_file:
        return

    quality = quality_var.get()

    command = [
        "gs",
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.4",
        f"-dPDFSETTINGS=/{quality}",
        "-dNOPAUSE",
        "-dQUIET",
        "-dBATCH",
        f"-sOutputFile={output_file}",
        input_file
    ]

    try:
        subprocess.run(command, check=True)
        messagebox.showinfo("Done", "PDF compressed successfully.")
    except Exception as e:
        messagebox.showerror("Error", f"Compression failed:\n{e}")

app = tk.Tk()
app.title("PDF Compressor")
app.geometry("350x180")

tk.Label(app, text="PDF Compressor", font=("Arial", 16, "bold")).pack(pady=10)

quality_var = tk.StringVar(value="ebook")

tk.OptionMenu(app, quality_var, "screen", "ebook", "printer", "prepress").pack(pady=10)

tk.Button(app, text="Select and Compress PDF", command=compress_pdf).pack(pady=15)

app.mainloop()