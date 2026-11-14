import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import App from "./App";
import axios from "./axios";

vi.mock("./axios", () => ({
    __esModule: true,
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: [] });
});

test("renders the Notes form and displays notes from the API", async () => {
    axios.get.mockResolvedValue({
        data: [
            {
                id: 1,
                title: "CloudForge test note",
                content: "Testing the Notes application.",
            },
        ],
    });

    render(<App />);

    expect(
        screen.getByRole("heading", { name: /add a new note/i })
    ).toBeInTheDocument();

    expect(
        screen.getByRole("heading", { name: /notes list/i })
    ).toBeInTheDocument();

    expect(await screen.findByText("CloudForge test note"))
        .toBeInTheDocument();

    expect(
        screen.getByText("Testing the Notes application.")
    ).toBeInTheDocument();

    expect(axios.get).toHaveBeenCalledWith("/api/notes/");
});

test("submits a new note and displays the returned note", async () => {
    axios.post.mockResolvedValue({
        data: {
            id: 2,
            title: "New CloudForge note",
            content: "Testing note creation.",
        },
    });

    render(<App />);

    fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: "  New CloudForge note  " },
    });

    fireEvent.change(screen.getByLabelText(/content/i), {
        target: { value: "  Testing note creation.  " },
    });

    fireEvent.click(
        screen.getByRole("button", { name: /add note/i })
    );

    await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith("/api/notes/", {
            title: "New CloudForge note",
            content: "Testing note creation.",
        });
    });

    expect(
        await screen.findByText("New CloudForge note")
    ).toBeInTheDocument();

    expect(
        screen.getByText("Testing note creation.")
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/title/i)).toHaveValue("");
    expect(screen.getByLabelText(/content/i)).toHaveValue("");
});

test("rejects empty fields without calling the API", async () => {
    render(<App />);

    await screen.findByText("No notes available.");

    fireEvent.click(
        screen.getByRole("button", { name: /add note/i })
    );

    expect(
        screen.getByText("Title and content are required.")
    ).toBeInTheDocument();

    expect(axios.post).not.toHaveBeenCalled();
});
