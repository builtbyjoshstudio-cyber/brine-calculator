document.addEventListener("DOMContentLoaded", () => {
    // Theme logic
    const themeBtns = document.querySelectorAll(".theme-switch button");
    themeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const theme = btn.getAttribute("data-set-theme");
            document.documentElement.setAttribute("data-theme", theme);
            themeBtns.forEach(b => b.classList.remove("on"));
            btn.classList.add("on");
        });
    });

    // Inputs
    const isDryBrineToggle = document.getElementById("brine-type-toggle");
    const isKgToggle = document.getElementById("unit-toggle");
    const volumeUnitToggle = document.getElementById("volume-unit-toggle");
    const proteinType = document.getElementById("protein-type");
    const meatWeight = document.getElementById("meat-weight");
    const meatWeightLabel = document.getElementById("meat-weight-label");
    const saltType = document.getElementById("salt-type");
    const brineStrength = document.getElementById("brine-strength");
    const includeSugar = document.getElementById("include-sugar");

    // Outputs
    const saltVolumeOutput = document.getElementById("salt-volume-output");
    const saltWeightOutput = document.getElementById("salt-weight-output");
    const waterSection = document.getElementById("water-section");
    const waterOutput = document.getElementById("water-output");
    const sugarSection = document.getElementById("sugar-section");
    const sugarOutput = document.getElementById("sugar-output");
    const timeOutput = document.getElementById("time-output");
    const notesOutput = document.getElementById("notes-output");
    
    const turkeyHelperContainer = document.getElementById("turkey-helper-container");
    const turkeyHelperToggle = document.getElementById("turkey-helper-toggle");
    const turkeyHelperNote = document.getElementById("turkey-helper-note");
    const saltWarningNode = document.getElementById("salt-warning-node");
    
    const calculateBtn = document.getElementById("calculate-btn");
    const copyBtn = document.getElementById("copy-btn");

    function updateUI() {
        if (isDryBrineToggle.checked) {
            waterSection.style.display = "none";
        } else {
            waterSection.style.display = "block";
        }
        
        if (includeSugar.checked) {
            sugarSection.style.display = "block";
        } else {
            sugarSection.style.display = "none";
        }
        
        if (proteinType.value === "turkey") {
            turkeyHelperContainer.style.display = "flex";
        } else {
            turkeyHelperContainer.style.display = "none";
            turkeyHelperToggle.checked = false;
        }
        
        if (turkeyHelperToggle.checked) {
            turkeyHelperNote.style.display = "block";
        } else {
            turkeyHelperNote.style.display = "none";
        }
        
        if (saltType.value === "table" || saltType.value === "morton") {
            saltWarningNode.style.display = "block";
            saltWarningNode.textContent = "Note: Table salt and Morton Kosher are significantly denser than Diamond Crystal Kosher. Ensure your brand matches your selection exactly to avoid a massive salt bomb!";
        } else {
            saltWarningNode.style.display = "none";
        }
        
        // Update labels based on unit toggle
        if (isKgToggle.checked) {
            meatWeightLabel.textContent = "Meat Weight (kg)";
        } else {
            meatWeightLabel.textContent = "Meat Weight (lbs)";
        }
    }

    isDryBrineToggle.addEventListener("change", updateUI);
    isKgToggle.addEventListener("change", updateUI);
    includeSugar.addEventListener("change", updateUI);
    proteinType.addEventListener("change", updateUI);
    turkeyHelperToggle.addEventListener("change", updateUI);
    saltType.addEventListener("change", updateUI);

    function formatTbsp(totalTbsp) {
        if (totalTbsp >= 16) {
            const cups = totalTbsp / 16;
            if (Number.isInteger(cups)) return `${cups} Cup${cups > 1 ? 's' : ''}`;
            return `${cups.toFixed(2)} Cups`;
        }
        
        if (totalTbsp < 1) {
            return `${(totalTbsp * 3).toFixed(1)} tsp`;
        }
        
        return `${totalTbsp.toFixed(1)} Tbsp`;
    }

    function calculate() {
        const weight = parseFloat(meatWeight.value) || 0;
        if (weight <= 0) return;

        const isDry = isDryBrineToggle.checked;
        const isKg = isKgToggle.checked;
        const isMetricLiquid = volumeUnitToggle.checked;
        const protein = proteinType.value;
        const salt = saltType.value;
        const strength = brineStrength.value;
        const hasSugar = includeSugar.checked;

        // Convert weight to grams
        const weightGrams = isKg ? weight * 1000 : weight * 453.592;
        const weightLbs = isKg ? weight * 2.20462 : weight;

        let saltGrams = 0;
        let waterGrams = 0;

        if (isDry) {
            // Dry Brine Math
            let ratio = 0.01; // Standard 1%
            if (strength === 'light') ratio = 0.0075;
            if (strength === 'strong') ratio = 0.0125;
            
            saltGrams = weightGrams * ratio;
        } else {
            // Wet Brine Math
            // Water volume is 50% of meat weight to submerge
            waterGrams = weightGrams * 0.5;
            
            // Equilibrium target in water (5% standard)
            let wetRatio = 0.05;
            if (strength === 'light') wetRatio = 0.04;
            if (strength === 'strong') wetRatio = 0.06;
            
            saltGrams = waterGrams * wetRatio;
        }

        // Salt Density Conversions
        let gramsPerTbsp = 15; // default
        if (salt === 'diamond') gramsPerTbsp = 8.44; // 135g/cup
        else if (salt === 'morton') gramsPerTbsp = 15.6; // 250g/cup
        else if (salt === 'table') gramsPerTbsp = 18.1; // 290g/cup
        else if (salt === 'sea') gramsPerTbsp = 15.6; // 250g/cup

        const tbspNeeded = saltGrams / gramsPerTbsp;

        // Render Salt
        if (isMetricLiquid) {
            saltVolumeOutput.textContent = `${saltGrams.toFixed(1)} g`;
            const mlNeeded = tbspNeeded * 15;
            saltWeightOutput.textContent = mlNeeded >= 100 ? `${mlNeeded.toFixed(0)} ml` : `${mlNeeded.toFixed(1)} ml`;
        } else {
            saltVolumeOutput.textContent = formatTbsp(tbspNeeded);
            saltWeightOutput.textContent = `${saltGrams.toFixed(1)} g`;
        }

        // Render Water
        if (!isDry) {
            const liters = waterGrams / 1000;
            const quarts = liters * 1.05669;
            
            if (isMetricLiquid) {
                const totalVol = liters < 1 ? `${(liters * 1000).toFixed(0)} ml` : `${liters.toFixed(2)} L`;
                const step1Vol = (liters * 0.25) < 1 ? `${((liters * 0.25) * 1000).toFixed(0)} ml` : `${(liters * 0.25).toFixed(2)} L`;
                const step2Vol = (liters * 0.75) < 1 ? `${((liters * 0.75) * 1000).toFixed(0)} ml` : `${(liters * 0.75).toFixed(2)} L`;
                
                waterOutput.innerHTML = `
                    <div style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">${totalVol} Total</div>
                    <div style="font-size: 13px; color: var(--text-soft); font-weight: 400; line-height: 1.4; text-align: left; font-family: var(--font-ui);">
                        <strong style="color: var(--text);">Step 1:</strong> Bring ${step1Vol} of water to a boil to completely dissolve the salt and sugar.<br><br>
                        <strong style="color: var(--text);">Step 2:</strong> Add ${step2Vol} of ice/cold water to safely chill the brine to fridge temperature before adding the meat.
                    </div>
                `;
            } else {
                waterOutput.innerHTML = `
                    <div style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">${quarts.toFixed(1)} Quarts (${liters.toFixed(1)} L)</div>
                    <div style="font-size: 13px; color: var(--text-soft); font-weight: 400; line-height: 1.4; text-align: left; font-family: var(--font-ui);">
                        <strong style="color: var(--text);">Step 1:</strong> Bring 25% of the total water volume to a boil to completely dissolve the salt and sugar.<br><br>
                        <strong style="color: var(--text);">Step 2:</strong> Add the remaining 75% of the volume as Ice and Cold Water to safely chill the brine to fridge temperature before adding the meat.
                    </div>
                `;
            }
        }

        // Render Sugar
        if (hasSugar) {
            const sugarGrams = saltGrams * 0.5;
            sugarOutput.textContent = `${sugarGrams.toFixed(1)} g`;
        }

        // Render Time
        let timeStr = "";
        if (isDry) {
            let hoursMin = Math.round(weightLbs * 1);
            let hoursMax = Math.round(weightLbs * 2);
            
            if (protein === 'turkey' || protein === 'chicken') {
                if (hoursMax > 24) hoursMax = 24;
            }
            if (hoursMin === hoursMax) {
                timeStr = `${hoursMin} hours (or overnight)`;
            } else {
                timeStr = `${hoursMin} - ${hoursMax} hours (or overnight)`;
            }
        } else {
            let hours = Math.round(weightLbs * 1);
            if (protein === 'turkey' || protein === 'chicken') {
                if (hours > 24) hours = 24;
            }
            timeStr = `${hours} hour${hours !== 1 ? 's' : ''}`;
        }
        timeOutput.textContent = timeStr;

        // Render Notes
        let notes = "Warning: Do not brine meat that is labeled as 'enhanced', 'basted', or 'pre-seasoned' (like most frozen turkeys), as it will be incredibly salty.<br><br>";
        if (isDry) {
            notes += "<strong>Method:</strong> Pat meat completely dry before applying salt. Rest uncovered on a wire rack in the fridge.";
        } else {
            notes += "<strong>Method:</strong> Always rinse the meat and pat completely dry after removing from a wet brine.";
        }
        notesOutput.innerHTML = notes;
    }

    calculateBtn.addEventListener("click", calculate);

    copyBtn.addEventListener("click", () => {
        let text = `Brine Recipe (${proteinType.options[proteinType.selectedIndex].text}, ${meatWeight.value} ${isKgToggle.checked ? 'kg' : 'lbs'}):\n`;
        text += `Salt: ${saltVolumeOutput.textContent} (${saltWeightOutput.textContent}) of ${saltType.options[saltType.selectedIndex].text}\n`;
        
        if (!isDryBrineToggle.checked) {
            text += `Water: ${waterOutput.textContent}\n`;
        }
        
        if (includeSugar.checked) {
            text += `Sugar: ${sugarOutput.textContent}\n`;
        }
        
        text += `Time: ${timeOutput.textContent}\n`;
        text += `Notes: ${notesOutput.innerText}`;

        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = "Copied!";
            setTimeout(() => copyBtn.textContent = originalText, 2000);
        });
    });

    // Init
    updateUI();
});